# Phase 16: 多标签系统 - Research

**Researched:** 2026-05-15
**Domain:** Multi-tag System with Many-to-Many Relationship and Data Migration
**Confidence:** HIGH

## Summary

This phase implements a structured multi-tag system that replaces the existing unstructured `books.tags` TEXT field with a proper many-to-many relationship. The core technical challenges are: (1) creating the tags and book_tags tables following the established pattern from Phase 14 (collections), (2) migrating existing comma-separated tag data to the new structured format, and (3) implementing multi-tag filtering with AND/OR combination support. The implementation follows established patterns from the existing codebase: Express Router for API routes, Zod for validation, sql.js for database operations, and Vue 3 Composition API for frontend components.

**Primary recommendation:** Implement tags as a separate route module (`tags.ts`) following the collections pattern exactly, with a junction table (`book_tags`) for the many-to-many relationship. Add a one-time data migration function to parse existing `books.tags` TEXT fields and populate the new tables. Support both AND and OR filtering modes for multi-tag selection.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Tag CRUD (create/update/delete) | API / Backend | — | Business logic and data persistence |
| Book-to-tag assignment | API / Backend | — | Many-to-many relationship management |
| Tag list retrieval with usage counts | API / Backend | — | Requires SQL JOIN/aggregate queries |
| Multi-tag filter logic (AND/OR) | API / Backend | — | Server-side filtering for performance |
| Tag filter UI | Browser / Client | — | UI interaction and state management |
| Tag management UI | Browser / Client | — | CRUD forms and dialogs |
| Data migration from TEXT field | API / Backend | — | One-time migration on startup |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Express Router | 5.2.1 | API routing | Consistent with existing routes (books.ts, collections.ts) |
| Zod | 4.4.3 | Request validation | Already used in validators/schemas.ts |
| sql.js (SQLite) | ^1.9.0 | Database operations | Existing database layer via models/book.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Axios | 1.6.7 | HTTP client | Frontend API calls (existing pattern) |
| Vue 3 Composition API | 3.4.21 | UI components | All frontend components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Junction table | JSON array column | JSON column loses referential integrity, no efficient queries |
| Server-side filtering | Client-side filtering | Server-side scales better for large book counts |
| AND/OR filter modes | AND only | OR mode provides better UX for exploratory filtering |

**Version verification:** Versions confirmed via npm view (Express 5.2.1, Zod 4.4.3).

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser / Client                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Library.vue                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ Search Box  │  │ Collection  │  │ Tag Filter (NEW)             │  │    │
│  │  │             │  │ Dropdown    │  │  - Multi-select tags         │  │    │
│  │  │             │  │             │  │  - AND/OR toggle             │  │    │
│  │  │             │  │             │  │  - Usage count per tag       │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │    │
│  │                          │                      │                    │    │
│  │                          ▼                      ▼                    │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │  BookGrid (filtered by tags with AND/OR logic)                 │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                              GET /api/books?tags=1,2,3&tagMode=AND          │
│                              GET /api/tags                                   │
│                                    │                                         │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTP/JSON
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API / Backend                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  routes/tags.ts (NEW)                                                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ GET /       │  │ POST /      │  │ PUT /:id                    │  │    │
│  │  │ List with   │  │ Create      │  │ Update name/color           │  │    │
│  │  │ usage counts│  │ tag         │  │                             │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │    │
│  │  ┌─────────────┐  ┌─────────────────────────────────────────────┐  │    │
│  │  │ DELETE /:id │  │ POST /books/:bookId/tags                    │  │    │
│  │  │ Delete      │  │ Set book tags (replace all)                 │  │    │
│  │  │ tag         │  │                                             │  │    │
│  │  └─────────────┘  └─────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  models/book.ts                                                      │    │
│  │  - tags table: id, name, color, created_at                          │    │
│  │  - book_tags table: book_id, tag_id (junction)                      │    │
│  │  - Migration: Parse books.tags TEXT → populate book_tags            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
backend/src/
├── routes/
│   ├── tags.ts             # NEW: Tag CRUD + book assignment
│   ├── books.ts            # MODIFY: Add tags query param + tagMode
│   └── ...
├── models/
│   └── book.ts             # MODIFY: Add tags + book_tags tables + migration
├── validators/
│   └── schemas.ts          # MODIFY: Add tag validation schemas
└── index.ts                # MODIFY: Register tags router

frontend/src/
├── api/
│   ├── books.ts            # MODIFY: Add tag API functions
│   └── tags.ts             # NEW: Tag API client
├── views/
│   ├── Library.vue         # MODIFY: Add tag filter with multi-select
│   └── BookDetail.vue      # MODIFY: Replace tags input with tag selector
├── components/
│   └── TagSelector.vue     # NEW: Multi-tag selection component
└── types/
    └── tag.ts              # NEW: TypeScript interfaces
```

### Pattern 1: Many-to-Many Junction Table (Same as Collections)

**What:** Use a junction table to represent the many-to-many relationship between books and tags.

**When to use:** Any relationship where an entity can belong to multiple parent entities and vice versa.

**Example:**
```sql
-- Source: [ROADMAP.md - Phase 16 Technical Notes]
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_tags (
  book_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### Pattern 2: Data Migration from TEXT Field

**What:** One-time migration to parse existing comma-separated tags and populate the new structured tables.

**When to use:** Converting unstructured text data to structured relational data.

**Example:**
```typescript
// In models/book.ts initDatabase(), after table creation
async function migrateTagsToStructured() {
  const database = db();
  
  // Check if migration already done
  const migrationFlag = database.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='book_tags'"
  );
  if (!migrationFlag) return; // Tables not created yet
  
  // Check if migration already completed
  const migrationComplete = database.get(
    "SELECT value FROM metadata WHERE key = 'tags_migration_complete'"
  );
  if (migrationComplete?.value === 'true') return;
  
  // Get all books with non-null tags
  const books = database.all(
    "SELECT id, tags FROM books WHERE tags IS NOT NULL AND tags != ''"
  );
  
  for (const book of books) {
    // Parse comma-separated tags
    const tagNames = book.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);
    
    for (const tagName of tagNames) {
      // Get or create tag
      let tag = database.get('SELECT id FROM tags WHERE name = ?', [tagName]);
      if (!tag) {
        const result = database.run(
          'INSERT INTO tags (name) VALUES (?)',
          [tagName]
        );
        tag = { id: result.lastInsertRowid };
      }
      
      // Link book to tag (ignore if already exists)
      try {
        database.run(
          'INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)',
          [book.id, tag.id]
        );
      } catch (e: any) {
        // Ignore duplicate key error
        if (e.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw e;
      }
    }
  }
  
  // Mark migration as complete
  database.run(
    "INSERT OR REPLACE INTO metadata (key, value) VALUES ('tags_migration_complete', 'true')"
  );
  await database.save();
}
```

### Pattern 3: Multi-Tag Filtering with AND/OR Logic

**What:** Support both intersection (AND) and union (OR) filtering modes for multi-tag selection.

**When to use:** When users need flexible filtering options for exploratory or precise searches.

**Example:**
```typescript
// In routes/books.ts GET / endpoint
router.get('/', validateQuery(bookQuerySchema), (req, res) => {
  const { page = 1, limit = 20, search, collection_id, status, tags, tagMode = 'OR' } = req.query as any;
  const offset = (page - 1) * limit;
  const database = db();

  let sql = 'SELECT DISTINCT b.* FROM books b';
  const params: any[] = [];
  const conditions: string[] = [];

  // ... existing filters (collection_id, search, status) ...

  if (tags) {
    const tagIds = tags.split(',').map((t: string) => parseInt(t, 10)).filter((n: number) => !isNaN(n));
    
    if (tagIds.length > 0) {
      if (tagMode === 'AND') {
        // AND logic: book must have ALL specified tags
        // Use subquery with HAVING COUNT = total tags
        sql += `
          WHERE b.id IN (
            SELECT bt.book_id
            FROM book_tags bt
            WHERE bt.tag_id IN (${tagIds.map(() => '?').join(',')})
            GROUP BY bt.book_id
            HAVING COUNT(DISTINCT bt.tag_id) = ?
          )
        `;
        params.push(...tagIds, tagIds.length);
      } else {
        // OR logic: book must have ANY of the specified tags
        sql += ' JOIN book_tags bt ON b.id = bt.book_id';
        conditions.push(`bt.tag_id IN (${tagIds.map(() => '?').join(',')})`);
        params.push(...tagIds);
      }
    }
  }

  // ... rest of query ...
});
```

### Anti-Patterns to Avoid

- **Storing tag IDs as comma-separated string in books table:** Breaks referential integrity, no efficient queries, loses CASCADE DELETE benefits
- **Client-side filtering for tags:** Will not scale as book count grows; server should handle filtering
- **N+1 query for tag usage counts:** Use JOIN with COUNT aggregate instead of separate queries per tag
- **Not migrating existing TEXT data:** Users will lose existing tag assignments

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tag name uniqueness | Manual check before insert | SQLite UNIQUE constraint | Race condition protection, simpler code |
| Tag usage count | Separate COUNT queries | SQL JOIN with GROUP BY | Single query, better performance |
| Cascade delete | Manual cleanup in application code | FOREIGN KEY ON DELETE CASCADE | Atomic, reliable, automatic |
| Request validation | Manual if/else checks | Zod schemas with validateBody middleware | Consistent error format, type safety |
| Multi-tag AND filter | Multiple queries or client-side filtering | SQL subquery with HAVING COUNT | Single efficient query |

**Key insight:** The existing codebase already has established patterns for all these concerns from Phase 14 (collections). Follow them exactly.

## Common Pitfalls

### Pitfall 1: Forgetting database.save() after write operations

**What goes wrong:** Changes appear to succeed but are lost on server restart.

**Why it happens:** sql.js is in-memory; changes must be explicitly persisted to disk.

**How to avoid:** Always call `database.save()` after INSERT/UPDATE/DELETE operations. See existing pattern in `routes/books.ts` and `routes/collections.ts`.

**Warning signs:** Data appears in responses but disappears after restart.

### Pitfall 2: Missing CASCADE DELETE consideration

**What goes wrong:** Deleting a tag leaves orphan records in book_tags.

**Why it happens:** Forgetting to add ON DELETE CASCADE to foreign key.

**How to avoid:** Use the exact schema from ROADMAP with CASCADE. Test by creating a tag, adding to a book, then deleting the tag.

**Warning signs:** `DELETE FROM tags` succeeds but `SELECT * FROM book_tags` still has references.

### Pitfall 3: Migration runs on every startup

**What goes wrong:** Migration logic executes repeatedly, causing performance issues or duplicate data.

**Why it happens:** Not checking if migration already completed.

**How to avoid:** Use a metadata table to track migration completion:
```typescript
// Create metadata table for tracking migrations
dbInstance.exec(`
  CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// Check migration flag before running
const migrationComplete = database.get(
  "SELECT value FROM metadata WHERE key = 'tags_migration_complete'"
);
if (migrationComplete?.value === 'true') return;
```

**Warning signs:** Server startup takes progressively longer; duplicate tag entries appear.

### Pitfall 4: Tag filter ignored when other filters are active

**What goes wrong:** User filters by tags and collection but only one filter applies.

**Why it happens:** Not combining filter conditions with AND in SQL query.

**How to avoid:** Chain conditions properly in the WHERE clause:
```typescript
if (conditions.length > 0) {
  sql += ' WHERE ' + conditions.join(' AND ');
}
```

**Warning signs:** Selecting tags resets collection selection in UI, or vice versa.

### Pitfall 5: UNIQUE constraint error not handled

**What goes wrong:** Creating duplicate tag name returns generic 500 error.

**Why it happens:** Not catching SQLITE_CONSTRAINT error code.

**How to avoid:** Follow existing pattern from collections.ts:
```typescript
catch (error: any) {
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ error: '标签名称已存在' });
  }
  res.status(500).json({ error: '创建标签失败' });
}
```

**Warning signs:** Duplicate name attempt shows "创建标签失败" instead of specific message.

## Code Examples

### Backend: Tags Route (Complete)

```typescript
// backend/src/routes/tags.ts
import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { tagSchema, idParamSchema, setBookTagsSchema } from '../validators/schemas.js';

const router = Router();

// GET /api/tags - List all tags with usage counts
router.get('/', (req, res) => {
  try {
    const database = db();
    const tags = database.all(`
      SELECT t.*, COUNT(bt.book_id) as usage_count
      FROM tags t
      LEFT JOIN book_tags bt ON t.id = bt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `);
    res.json(tags);
  } catch (error) {
    console.error('Failed to get tags:', error);
    res.status(500).json({ error: '获取标签列表失败' });
  }
});

// POST /api/tags - Create new tag
router.post('/', authMiddleware, validateBody(tagSchema), (req, res) => {
  try {
    const { name, color } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO tags (name, color) VALUES (?, ?)',
      [name, color || null]
    );
    database.save();
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      color: color || null,
      usage_count: 0
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '标签名称已存在' });
    }
    console.error('Failed to create tag:', error);
    res.status(500).json({ error: '创建标签失败' });
  }
});

// PUT /api/tags/:id - Update tag
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(tagSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const { name, color } = req.body;
    const database = db();

    const existing = database.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '标签不存在' });
    }

    database.run(
      'UPDATE tags SET name = ?, color = ? WHERE id = ?',
      [name, color || null, id]
    );
    database.save();

    const updated = database.get(`
      SELECT t.*, COUNT(bt.book_id) as usage_count
      FROM tags t
      LEFT JOIN book_tags bt ON t.id = bt.tag_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [id]);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '标签名称已存在' });
    }
    console.error('Failed to update tag:', error);
    res.status(500).json({ error: '更新标签失败' });
  }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const existing = database.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '标签不存在' });
    }

    // CASCADE will automatically delete book_tags entries
    database.run('DELETE FROM tags WHERE id = ?', [id]);
    database.save();
    res.json({ success: true, message: '标签已删除' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    res.status(500).json({ error: '删除标签失败' });
  }
});

// GET /api/tags/book/:bookId - Get tags for a specific book
router.get('/book/:bookId', (req, res) => {
  try {
    const { bookId } = req.params as any;
    const database = db();

    const tags = database.all(`
      SELECT t.*
      FROM tags t
      JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id = ?
      ORDER BY t.name
    `, [bookId]);

    res.json(tags);
  } catch (error) {
    console.error('Failed to get book tags:', error);
    res.status(500).json({ error: '获取书籍标签失败' });
  }
});

// POST /api/tags/books/:bookId - Set tags for a book (replace all)
router.post('/books/:bookId', authMiddleware, validateParams(idParamSchema), validateBody(setBookTagsSchema), (req, res) => {
  try {
    const { bookId } = req.params as any;
    const { tagIds } = req.body;
    const database = db();

    // Verify book exists
    const book = database.get('SELECT id FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    // Remove all existing tags for this book
    database.run('DELETE FROM book_tags WHERE book_id = ?', [bookId]);

    // Add new tags
    for (const tagId of tagIds) {
      // Verify tag exists
      const tag = database.get('SELECT id FROM tags WHERE id = ?', [tagId]);
      if (!tag) {
        continue; // Skip invalid tag IDs
      }

      try {
        database.run(
          'INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)',
          [bookId, tagId]
        );
      } catch (e: any) {
        // Ignore duplicate key error
        if (e.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw e;
      }
    }

    database.save();

    // Return updated tag list
    const tags = database.all(`
      SELECT t.*
      FROM tags t
      JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id = ?
      ORDER BY t.name
    `, [bookId]);

    res.json(tags);
  } catch (error) {
    console.error('Failed to set book tags:', error);
    res.status(500).json({ error: '设置书籍标签失败' });
  }
});

export default router;
```

### Backend: Books Route Modification

```typescript
// backend/src/routes/books.ts - Add tag filter support
// Modify the GET / route:

router.get('/', validateQuery(bookQuerySchema), (req, res) => {
  const { page = 1, limit = 20, search, collection_id, status, tags, tagMode = 'OR' } = req.query as any;
  const offset = (page - 1) * limit;
  const database = db();

  let sql = 'SELECT DISTINCT b.* FROM books b';
  const params: any[] = [];
  const conditions: string[] = [];

  if (collection_id) {
    sql += ' JOIN book_collections bc ON b.id = bc.book_id';
    conditions.push('bc.collection_id = ?');
    params.push(collection_id);
  }

  if (search) {
    conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push('b.reading_status = ?');
    params.push(status);
  }

  // NEW: Tag filtering with AND/OR support
  if (tags) {
    const tagIds = tags.split(',').map((t: string) => parseInt(t, 10)).filter((n: number) => !isNaN(n));
    
    if (tagIds.length > 0) {
      if (tagMode === 'AND') {
        // AND logic: book must have ALL specified tags
        const subquery = `
          b.id IN (
            SELECT bt.book_id
            FROM book_tags bt
            WHERE bt.tag_id IN (${tagIds.map(() => '?').join(',')})
            GROUP BY bt.book_id
            HAVING COUNT(DISTINCT bt.tag_id) = ?
          )
        `;
        conditions.push(subquery);
        params.push(...tagIds, tagIds.length);
      } else {
        // OR logic: book must have ANY of the specified tags
        sql += ' JOIN book_tags bt ON b.id = bt.book_id';
        conditions.push(`bt.tag_id IN (${tagIds.map(() => '?').join(',')})`);
        params.push(...tagIds);
      }
    }
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const books = database.all(sql, params);

  // Count query needs similar logic
  let countSql = 'SELECT COUNT(DISTINCT b.id) as total FROM books b';
  const countParams: any[] = [];
  const countConditions: string[] = [];

  if (collection_id) {
    countSql += ' JOIN book_collections bc ON b.id = bc.book_id';
    countConditions.push('bc.collection_id = ?');
    countParams.push(collection_id);
  }

  if (search) {
    countConditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    countParams.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    countConditions.push('b.reading_status = ?');
    countParams.push(status);
  }

  if (tags) {
    const tagIds = tags.split(',').map((t: string) => parseInt(t, 10)).filter((n: number) => !isNaN(n));
    
    if (tagIds.length > 0) {
      if (tagMode === 'AND') {
        const subquery = `
          b.id IN (
            SELECT bt.book_id
            FROM book_tags bt
            WHERE bt.tag_id IN (${tagIds.map(() => '?').join(',')})
            GROUP BY bt.book_id
            HAVING COUNT(DISTINCT bt.tag_id) = ?
          )
        `;
        countConditions.push(subquery);
        countParams.push(...tagIds, tagIds.length);
      } else {
        countSql += ' JOIN book_tags bt ON b.id = bt.book_id';
        countConditions.push(`bt.tag_id IN (${tagIds.map(() => '?').join(',')})`);
        countParams.push(...tagIds);
      }
    }
  }

  if (countConditions.length > 0) {
    countSql += ' WHERE ' + countConditions.join(' AND ');
  }

  const totalResult = database.get(countSql, countParams) as { total: number };
  const totalPages = Math.ceil(totalResult.total / limit);

  res.json({
    data: books,
    pagination: { page, limit, total: totalResult.total, totalPages, hasMore: page < totalPages }
  });
});
```

### Backend: Zod Schema Addition

```typescript
// backend/src/validators/schemas.ts - Add tag schemas

// Tag schema
export const tagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50字符'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$|^$/, '颜色格式无效').optional(),
});

// Set book tags schema
export const setBookTagsSchema = z.object({
  tagIds: z.array(z.number().int().positive()),
});

// Book query schema update
export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.coerce.number().int().positive().optional(),
  collection_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['want_to_read', 'reading', 'read']).optional(),
  tags: z.string().optional(), // NEW: Comma-separated tag IDs
  tagMode: z.enum(['AND', 'OR']).default('OR'), // NEW: Filter mode
});

// Type exports
export type TagInput = z.infer<typeof tagSchema>;
export type SetBookTagsInput = z.infer<typeof setBookTagsSchema>;
```

### Backend: Database Schema Addition

```typescript
// backend/src/models/book.ts - Add to initDatabase function

// Add after book_collections table creation
dbInstance.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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

// Add metadata table for tracking migrations
dbInstance.exec(`
  CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// Add indexes
dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_tags_book ON book_tags(book_id)`);
dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_tags_tag ON book_tags(tag_id)`);

// Run data migration
await migrateTagsToStructured();
```

### Frontend: Tag API Client

```typescript
// frontend/src/api/tags.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Tag {
  id: number;
  name: string;
  color: string | null;
  usage_count: number;
  created_at: string;
}

export async function getTags(): Promise<Tag[]> {
  const response = await api.get('/tags');
  return response.data;
}

export async function createTag(data: {
  name: string;
  color?: string;
}): Promise<Tag> {
  const response = await api.post('/tags', data);
  return response.data;
}

export async function updateTag(
  id: number,
  data: { name: string; color?: string }
): Promise<Tag> {
  const response = await api.put(`/tags/${id}`, data);
  return response.data;
}

export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/tags/${id}`);
}

export async function getBookTags(bookId: number): Promise<Tag[]> {
  const response = await api.get(`/tags/book/${bookId}`);
  return response.data;
}

export async function setBookTags(bookId: number, tagIds: number[]): Promise<Tag[]> {
  const response = await api.post(`/tags/books/${bookId}`, { tagIds });
  return response.data;
}
```

### Frontend: Library.vue Modification (Tag Filter)

```vue
<!-- frontend/src/views/Library.vue - Add tag filter -->
<template>
  <div class="library">
    <div class="library-header">
      <!-- Existing filters -->
      <div class="search-box">...</div>
      <div class="filter-box">
        <select v-model="selectedCategory" @change="filterBooks">...</select>
      </div>
      <div class="filter-box">
        <select v-model="selectedCollection" @change="handleCollectionChange">...</select>
      </div>
      <div class="filter-box">
        <select v-model="selectedStatus" @change="handleStatusChange">...</select>
      </div>
      
      <!-- NEW: Tag filter with multi-select -->
      <div class="tag-filter-box">
        <div class="tag-filter-header">
          <span>标签筛选</span>
          <button 
            @click="tagFilterMode = tagFilterMode === 'AND' ? 'OR' : 'AND'" 
            class="mode-toggle"
          >
            {{ tagFilterMode }}
          </button>
        </div>
        <div class="tag-chips">
          <button
            v-for="tag in tags"
            :key="tag.id"
            :class="['tag-chip', { active: selectedTags.has(tag.id) }]"
            :style="{ borderColor: tag.color || 'var(--border-light)' }"
            @click="toggleTag(tag.id)"
          >
            {{ tag.name }} ({{ tag.usage_count }})
          </button>
        </div>
      </div>
    </div>
    <!-- ... rest of template ... -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import BookCard from '../components/BookCard.vue';
import { getBooks, getCategories, type Book, type Category } from '../api/books';
import { getCollections, type Collection } from '../api/collections';
import { getTags, type Tag } from '../api/tags';
import { getReadingHistory } from '../api/reading';

const router = useRouter();

const books = ref<Book[]>([]);
const categories = ref<Category[]>([]);
const collections = ref<Collection[]>([]);
const tags = ref<Tag[]>([]);
const readingHistory = ref<any[]>([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedCollection = ref<number | null>(null);
const selectedStatus = ref<string | null>(null);
const selectedTags = ref<Set<number>>(new Set());
const tagFilterMode = ref<'AND' | 'OR'>('OR');

// ... existing computed properties ...

async function loadData() {
  try {
    const [booksData, categoriesData, collectionsData, tagsData, historyData] = await Promise.all([
      getBooks(),
      getCategories(),
      getCollections(),
      getTags(),
      getReadingHistory()
    ]);
    books.value = booksData;
    categories.value = categoriesData;
    collections.value = collectionsData;
    tags.value = tagsData;
    readingHistory.value = historyData;
  } catch (error) {
    console.error('Failed to load library data:', error);
  }
}

function toggleTag(tagId: number) {
  if (selectedTags.value.has(tagId)) {
    selectedTags.value.delete(tagId);
  } else {
    selectedTags.value.add(tagId);
  }
  handleTagChange();
}

async function handleTagChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value || undefined,
      selectedStatus.value || undefined,
      tagIds || undefined,
      tagFilterMode.value
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by tags:', error);
  }
}

// Update other filter handlers to include tag filter
async function handleCollectionChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value,
      selectedStatus.value || undefined,
      tagIds || undefined,
      tagFilterMode.value
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by collection:', error);
  }
}

async function handleStatusChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value || undefined,
      selectedStatus.value,
      tagIds || undefined,
      tagFilterMode.value
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by status:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>
```

### Frontend: BookDetail.vue Modification (Tag Selector)

```vue
<!-- frontend/src/views/BookDetail.vue - Replace tags input with tag selector -->
<template>
  <div class="book-detail">
    <!-- ... existing template ... -->
    
    <div class="edit-section">
      <h2>
        <span class="section-icon">✏️</span>
        编辑信息
      </h2>
      <div class="edit-form">
        <div class="form-group">
          <label for="category">分类</label>
          <select id="category" v-model="editForm.category">
            <option value="">未分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
        </div>
        
        <!-- NEW: Tag selector replacing text input -->
        <div class="form-group">
          <label>标签</label>
          <div class="tag-selector">
            <div class="selected-tags">
              <span
                v-for="tag in bookTags"
                :key="tag.id"
                class="selected-tag"
                :style="{ backgroundColor: tag.color || 'var(--color-primary-100)' }"
              >
                {{ tag.name }}
                <button @click="removeTag(tag.id)" class="remove-tag">×</button>
              </span>
              <span v-if="bookTags.length === 0" class="no-tags">未设置标签</span>
            </div>
            <div class="available-tags">
              <button
                v-for="tag in availableTags"
                :key="tag.id"
                type="button"
                :class="['available-tag', { selected: isTagSelected(tag.id) }]"
                :style="{ borderColor: tag.color || 'var(--border-light)' }"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Existing collection selector -->
        <div class="form-group">...</div>
        
        <button @click="saveEdit" :disabled="saving" class="btn btn-secondary">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getBook, getCategories, updateBook, type Book, type Category } from '../api/books';
import { getCollections, addBookToCollection, removeBookFromCollection, getBookCollections, type Collection } from '../api/collections';
import { getTags, getBookTags, setBookTags, type Tag } from '../api/tags';
import { getProgress, type ReadingProgress } from '../api/reading';

const route = useRoute();
const bookId = computed(() => Number(route.params.id));

const book = ref<Book | null>(null);
const progress = ref<ReadingProgress | null>(null);
const categories = ref<Category[]>([]);
const collections = ref<Collection[]>([]);
const bookCollections = ref<Set<number>>(new Set());
const allTags = ref<Tag[]>([]);
const bookTags = ref<Tag[]>([]);
const loading = ref(true);
const error = ref('');

const editForm = ref({
  category: ''
});
const saving = ref(false);

const availableTags = computed(() => {
  const selectedIds = new Set(bookTags.value.map(t => t.id));
  return allTags.value.filter(t => !selectedIds.has(t.id));
});

function isTagSelected(tagId: number): boolean {
  return bookTags.value.some(t => t.id === tagId);
}

async function toggleTag(tagId: number) {
  const newTagIds = isTagSelected(tagId)
    ? bookTags.value.filter(t => t.id !== tagId).map(t => t.id)
    : [...bookTags.value.map(t => t.id), tagId];
  
  try {
    const updatedTags = await setBookTags(bookId.value, newTagIds);
    bookTags.value = updatedTags;
    
    // Refresh all tags to update usage counts
    const tagsData = await getTags();
    allTags.value = tagsData;
  } catch (error) {
    console.error('Failed to toggle tag:', error);
  }
}

async function removeTag(tagId: number) {
  const newTagIds = bookTags.value.filter(t => t.id !== tagId).map(t => t.id);
  
  try {
    const updatedTags = await setBookTags(bookId.value, newTagIds);
    bookTags.value = updatedTags;
    
    // Refresh all tags to update usage counts
    const tagsData = await getTags();
    allTags.value = tagsData;
  } catch (error) {
    console.error('Failed to remove tag:', error);
  }
}

async function loadBook() {
  try {
    loading.value = true;
    error.value = '';

    const [bookData, progressData, categoriesData, collectionsData, bookCollectionIds, tagsData, bookTagsData] = await Promise.all([
      getBook(bookId.value),
      getProgress(bookId.value).catch(() => null),
      getCategories(),
      getCollections(),
      getBookCollections(bookId.value).catch(() => []),
      getTags(),
      getBookTags(bookId.value).catch(() => [])
    ]);

    book.value = bookData;
    progress.value = progressData;
    categories.value = categoriesData;
    collections.value = collectionsData;
    bookCollections.value = new Set(bookCollectionIds);
    allTags.value = tagsData;
    bookTags.value = bookTagsData;

    editForm.value = {
      category: bookData.category || ''
    };
  } catch (err: any) {
    error.value = err.response?.data?.error || '加载失败';
  } finally {
    loading.value = false;
  }
}

async function saveEdit() {
  if (!book.value) return;

  try {
    saving.value = true;

    const updated = await updateBook(book.value.id, {
      category: editForm.value.category
    });

    book.value = updated;
  } catch (err: any) {
    console.error('Save error:', err);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadBook();
});
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| books.tags TEXT field (comma-separated) | tags + book_tags tables (structured) | Phase 16 | Referential integrity, efficient queries, usage counts |
| Single tag filter (text match) | Multi-tag filter with AND/OR modes | Phase 16 | Flexible filtering, better UX |
| Client-side tag parsing | Server-side structured storage | Phase 16 | Consistent data, no parsing errors |

**Deprecated/outdated:**
- books.tags TEXT field: Will be migrated to book_tags table, field can be deprecated after migration

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Color will be hex format (#RRGGBB) | Code Examples | May need to support named colors or RGB |
| A2 | Existing tags TEXT field uses comma as separator | Data Migration | May use different separator (semicolon, space) |
| A3 | Tag names should be unique globally | Database Schema | May want to allow duplicate names with different colors |
| A4 | CASCADE DELETE is sufficient for removing book-tag associations | Database Schema | Complex cleanup may be needed if additional constraints exist |

## Open Questions

1. **Tag color picker UI**
   - What we know: Color field is TEXT, ROADMAP shows it as optional
   - What's unclear: Should use native color input or predefined palette?
   - Recommendation: Use predefined palette of 8-10 colors for simplicity; native color input if user requests more

2. **Tag creation flow**
   - What we know: Tags can be created via POST /api/tags
   - What's unclear: Should tags be auto-created when user types a new tag name in BookDetail?
   - Recommendation: No auto-creation; require explicit tag creation first to avoid accidental duplicates

3. **Migration of existing tags**
   - What we know: books.tags TEXT field exists with comma-separated values
   - What's unclear: What if tags field uses different separator or has inconsistent formatting?
   - Recommendation: Parse with multiple separators (comma, semicolon), trim whitespace, skip empty values

4. **Tag filter default mode**
   - What we know: AND/OR modes both supported
   - What's unclear: Which mode should be default?
   - Recommendation: OR mode as default (more inclusive, better for exploration)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | ES2022 target | — |
| sql.js | Database | ✓ | ^1.9.0 | — |
| Express | API | ✓ | 5.2.1 | — |
| Vue 3 | Frontend | ✓ | 3.4.21 | — |
| Zod | Validation | ✓ | 4.4.3 | — |

**Missing dependencies with no fallback:** None — all dependencies are already in the project.

**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (detected in backend) |
| Config file | backend/package.json scripts |
| Quick run command | `cd backend && npm test -- --testPathPattern=tags` |
| Full suite command | `cd backend && npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TAG-01 | Create, delete, rename tag | unit | `npm test -- --testPathPattern=tags` | ❌ Wave 0 |
| TAG-02 | Set color for tag | unit | `npm test -- --testPathPattern=tags` | ❌ Wave 0 |
| TAG-03 | Add multiple tags to book (many-to-many) | integration | `npm test -- --testPathPattern=book-tags` | ❌ Wave 0 |
| TAG-04 | Remove tag from book | integration | `npm test -- --testPathPattern=book-tags` | ❌ Wave 0 |
| TAG-05 | Filter books by tags (AND/OR) | integration | `npm test -- --testPathPattern=books-filter` | ❌ Wave 0 |
| TAG-06 | Display usage count per tag | unit | `npm test -- --testPathPattern=tags-count` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<feature>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `backend/src/__tests__/tags.test.ts` — covers TAG-01, TAG-02, TAG-06
- [ ] `backend/src/__tests__/book-tags.test.ts` — covers TAG-03, TAG-04
- [ ] `backend/src/__tests__/books-filter.test.ts` — covers TAG-05
- [ ] Framework config: Already exists (Jest configured in backend/package.json)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | JWT token via authMiddleware (existing) |
| V3 Session Management | yes | Token stored in localStorage (existing) |
| V4 Access Control | yes | authMiddleware on write operations (existing) |
| V5 Input Validation | yes | Zod schemas for all inputs (existing) |
| V6 Cryptography | no | No encryption required for this feature |

### Known Threat Patterns for Express + SQLite

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL Injection | Tampering | Prepared statements (existing pattern) |
| CSRF | Tampering | CORS configuration (existing) |
| XSS | Tampering | Input validation via Zod (existing) |
| IDOR | Information Disclosure | Auth check before data access (existing authMiddleware) |

## Sources

### Primary (HIGH confidence)
- Project codebase analysis (VERIFIED: file reads)
- ROADMAP.md Phase 16 specification (VERIFIED: file read)
- Existing patterns from collections.ts, books.ts (VERIFIED: codebase)
- Phase 14 RESEARCH.md (VERIFIED: file read)

### Secondary (MEDIUM confidence)
- None needed — all patterns exist in codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use
- Architecture: HIGH - Follows existing patterns exactly from Phase 14
- Pitfalls: HIGH - Based on codebase analysis and Phase 14 experience

**Research date:** 2026-05-15
**Valid until:** 30 days (stable patterns)

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAG-01 | 创建、删除、重命名标签 | Standard CRUD pattern from collections.ts; Zod validation; Express Router |
| TAG-02 | 标签颜色设置 | TEXT field in tags table; color optional; UI patterns from BookDetail.vue |
| TAG-03 | 为书籍添加多个标签（多对多） | Junction table book_tags; POST /tags/books/:bookId endpoint (replace all) |
| TAG-04 | 从书籍移除标签 | DELETE from book_tags; CASCADE handles cleanup |
| TAG-05 | 按标签筛选（支持组合） | Modify GET /books to accept tags param + tagMode (AND/OR); SQL subquery for AND logic |
| TAG-06 | 标签列表显示使用次数 | SQL LEFT JOIN with COUNT aggregate in GET /tags |
