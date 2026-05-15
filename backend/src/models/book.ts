import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs/promises';

// SQL.js compatible database wrapper
class SQLiteDatabase {
  private db: any;
  private dbPath: string;

  constructor(db: any, dbPath: string) {
    this.db = db;
    this.dbPath = dbPath;
  }

  run(sql: string, params: any[] = []) {
    this.db.run(sql, params);
    return { lastInsertRowid: this.db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || 0, changes: 0 };
  }

  get(sql: string, params: any[] = []): any {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(sql: string, params: any[] = []): any[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  exec(sql: string) {
    this.db.run(sql);
  }

  async save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    await fs.writeFile(this.dbPath, buffer);
  }
}

let dbInstance: SQLiteDatabase | null = null;

async function initDatabase(): Promise<SQLiteDatabase> {
  const SQL = await initSqlJs();
  
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'books.db');
  
  let db: any;
  try {
    const buffer = await fs.readFile(dbPath);
    db = new SQL.Database(buffer);
  } catch {
    db = new SQL.Database();
  }
  
  dbInstance = new SQLiteDatabase(db, dbPath);

  // Create tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      cover_path TEXT,
      category TEXT,
      category_id INTEGER,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS reading_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      current_page INTEGER DEFAULT 0,
      current_chapter TEXT,
      progress_percent REAL DEFAULT 0,
      last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      page_number INTEGER,
      chapter TEXT,
      position TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      page_number INTEGER,
      chapter TEXT,
      position TEXT,
      content TEXT NOT NULL,
      color TEXT DEFAULT 'yellow',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  // Highlights table for EPUB text highlighting
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      cfi_range TEXT NOT NULL,
      selected_text TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'yellow',
      note TEXT,
      chapter TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  // Collections table for organizing books
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Book-collections junction table (many-to-many relationship)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS book_collections (
      book_id INTEGER NOT NULL,
      collection_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (book_id, collection_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )
  `);

  // Tags table for multi-tag system
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Book-tags junction table (many-to-many relationship)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS book_tags (
      book_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (book_id, tag_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Metadata table for migration tracking
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Add reading_status column to books table if it doesn't exist
  const columns = dbInstance.all("PRAGMA table_info(books)");
  const hasReadingStatus = columns.some((col: any) => col.name === 'reading_status');
  if (!hasReadingStatus) {
    dbInstance.exec(`ALTER TABLE books ADD COLUMN reading_status TEXT DEFAULT 'want_to_read'`);
  }

  // Create indexes
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_collections_book ON book_collections(book_id)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_collections_collection ON book_collections(collection_id)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_tags_book ON book_tags(book_id)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_tags_tag ON book_tags(tag_id)`);

  // Run tag data migration from books.tags TEXT field
  const migrationComplete = dbInstance.get(
    "SELECT value FROM metadata WHERE key = 'tags_migration_complete'"
  );

  if (!migrationComplete || migrationComplete.value !== 'true') {
    // Get all books with non-null tags
    const booksWithTags = dbInstance.all(
      "SELECT id, tags FROM books WHERE tags IS NOT NULL AND tags != ''"
    );

    for (const book of booksWithTags) {
      // Parse comma-separated tags (handle multiple separators)
      const tagNames = (book.tags as string)
        .split(/[,;，；]/) // Support comma, semicolon, Chinese variants
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);

      for (const tagName of tagNames) {
        // Get or create tag
        let tag = dbInstance.get('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (!tag) {
          const result = dbInstance.run(
            'INSERT INTO tags (name) VALUES (?)',
            [tagName]
          );
          tag = { id: result.lastInsertRowid };
        }

        // Link book to tag (ignore if already exists)
        try {
          dbInstance.run(
            'INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)',
            [book.id, tag.id]
          );
        } catch (e: any) {
          // Only ignore unique constraint violations - everything else is critical
          if (e.code === 'SQLITE_CONSTRAINT' || e.message?.includes('UNIQUE constraint failed') || e.message?.includes('PRIMARY KEY constraint failed')) {
            // Already exists - this is expected and safe to ignore
            continue;
          }
          // Log critical error with context before re-throwing
          console.error(`Migration failed for book ${book.id}, tag ${tag.id}:`, e);
          throw e;
        }
      }
    }

    // Mark migration as complete
    dbInstance.run(
      "INSERT OR REPLACE INTO metadata (key, value) VALUES ('tags_migration_complete', 'true')"
    );
  }

  await dbInstance.save();
  
  return dbInstance;
}

// Sync getter for use after init
function getDb(): SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return dbInstance;
}

export { initDatabase, getDb as db, SQLiteDatabase };
