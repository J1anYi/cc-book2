# Phase 14: 收藏夹系统 - Research

**Researched:** 2026-05-14
**Domain:** Collection/Favorites Management with Many-to-Many Relationship
**Confidence:** HIGH

## Summary

This phase implements a collection system that allows users to organize books into custom collections (favorites). The core technical challenge is implementing a many-to-many relationship between books and collections, which differs from the existing category system (one-to-many). The implementation follows established patterns from the existing codebase: Express Router for API routes, Zod for validation, sql.js for database operations, and Vue 3 Composition API for frontend components.

**Primary recommendation:** Implement collections as a separate route module (`collections.ts`) following the existing category pattern, with a junction table (`book_collections`) for the many-to-many relationship. Add collection filtering to Library.vue alongside the existing category filter.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Collection CRUD (create/update/delete) | API / Backend | — | Business logic and data persistence |
| Book-to-collection assignment | API / Backend | — | Many-to-many relationship management |
| Collection list retrieval with book counts | API / Backend | — | Requires SQL JOIN/aggregate queries |
| Collection filter UI | Browser / Client | — | UI interaction and state management |
| Collection management UI | Browser / Client | — | CRUD forms and dialogs |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Express Router | 4.18.2 | API routing | Consistent with existing routes (books.ts, categories.ts) |
| Zod | ^3.22.4 | Request validation | Already used in validators/schemas.ts |
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

**Version verification:** Existing versions confirmed from package.json files.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser / Client                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Library.vue                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ Search Box  │  │ Category    │  │ Collection Filter (NEW)     │  │    │
│  │  │             │  │ Dropdown    │  │  - Collection list          │  │    │
│  │  │             │  │             │  │  - Book count per collection│  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │    │
│  │                          │                      │                    │    │
│  │                          ▼                      ▼                    │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │  BookGrid (filtered by collection and/or category)             │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                              GET /api/books?collection_id=X                  │
│                              GET /api/collections                            │
│                                    │                                         │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTP/JSON
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API / Backend                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  routes/collections.ts (NEW)                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ GET /       │  │ POST /      │  │ PUT /:id                    │  │    │
│  │  │ List with   │  │ Create      │  │ Update name/icon/color      │  │    │
│  │  │ book counts │  │ collection  │  │                             │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │    │
│  │  ┌─────────────┐  ┌─────────────────────────────────────────────┐  │    │
│  │  │ DELETE /:id │  │ POST /:id/books/:bookId                     │  │    │
│  │  │ Delete      │  │ Add book to collection                      │  │    │
│  │  │ collection  │  │                                             │  │    │
│  │  └─────────────┘  └─────────────────────────────────────────────┘  │    │
│  │  ┌─────────────────────────────────────────────────────────────┐  │    │
│  │  │ DELETE /:id/books/:bookId                                    │  │    │
│  │  │ Remove book from collection                                  │  │    │
│  │  └─────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  models/book.ts                                                      │    │
│  │  - collections table: id, name, icon, color, description            │    │
│  │  - book_collections table: book_id, collection_id (junction)       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
backend/src/
├── routes/
│   ├── collections.ts     # NEW: Collection CRUD + book assignment
│   ├── books.ts           # MODIFY: Add collection_id query param
│   └── ...
├── models/
│   └── book.ts            # MODIFY: Add collections + book_collections tables
├── validators/
│   └── schemas.ts         # MODIFY: Add collection validation schemas
└── index.ts               # MODIFY: Register collections router

frontend/src/
├── api/
│   ├── books.ts           # MODIFY: Add collection API functions
│   └── collections.ts     # NEW: Collection API client
├── views/
│   ├── Library.vue        # MODIFY: Add collection filter
│   └── BookDetail.vue     # MODIFY: Add collection assignment UI
├── components/
│   └── CollectionManager.vue  # NEW: Collection CRUD UI (optional modal)
└── types/
    └── collection.ts      # NEW: TypeScript interfaces
```

### Pattern 1: Many-to-Many Junction Table

**What:** Use a junction table to represent the many-to-many relationship between books and collections.

**When to use:** Any relationship where an entity can belong to multiple parent entities and vice versa.

**Example:**
```sql
-- Source: [ROADMAP.md - Phase 14 Technical Notes]
CREATE TABLE collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_collections (
  book_id INTEGER NOT NULL,
  collection_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_id, collection_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);
```

### Pattern 2: Express Router with Zod Validation

**What:** Follow existing pattern for route handlers with validation middleware.

**When to use:** All new API endpoints.

**Example:**
```typescript
// Source: [backend/src/routes/categories.ts]
import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { collectionSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', (req, res) => {
  const database = db();
  const collections = database.all(`
    SELECT c.*, COUNT(bc.book_id) as book_count
    FROM collections c
    LEFT JOIN book_collections bc ON c.id = bc.collection_id
    GROUP BY c.id
    ORDER BY c.name
  `);
  res.json(collections);
});

router.post('/', authMiddleware, validateBody(collectionSchema), (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO collections (name, description, icon, color) VALUES (?, ?, ?, ?)',
      [name, description || null, icon || null, color || null]
    );
    database.save();
    res.status(201).json({ id: result.lastInsertRowid, name, description, icon, color });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Collection name already exists' });
    }
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

export default router;
```

### Pattern 3: Vue 3 Component with Collection Filter

**What:** Add collection filter dropdown alongside existing category filter in Library.vue.

**When to use:** Filtering views by collection membership.

**Example:**
```vue
<!-- Source: [frontend/src/views/Library.vue pattern] -->
<template>
  <div class="library-header">
    <!-- Existing search and category filter -->
    <div class="filter-box">
      <select v-model="selectedCategory" @change="filterBooks">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.name">
          {{ cat.name }}
        </option>
      </select>
    </div>
    <!-- NEW: Collection filter -->
    <div class="filter-box">
      <select v-model="selectedCollection" @change="filterBooks">
        <option value="">全部收藏夹</option>
        <option v-for="col in collections" :key="col.id" :value="col.id">
          {{ col.icon || '📁' }} {{ col.name }} ({{ col.book_count }})
        </option>
      </select>
    </div>
  </div>
</template>
```

### Anti-Patterns to Avoid

- **Storing collection IDs as comma-separated string in books table:** Breaks referential integrity, no efficient queries, loses CASCADE DELETE benefits
- **Client-side filtering for collections:** Will not scale as book count grows; server should handle filtering
- **N+1 query for book counts:** Use JOIN with COUNT aggregate instead of separate queries per collection

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collection name uniqueness | Manual check before insert | SQLite UNIQUE constraint | Race condition protection, simpler code |
| Book count per collection | Separate COUNT queries | SQL JOIN with GROUP BY | Single query, better performance |
| Cascade delete | Manual cleanup in application code | FOREIGN KEY ON DELETE CASCADE | Atomic, reliable, automatic |
| Request validation | Manual if/else checks | Zod schemas with validateBody middleware | Consistent error format, type safety |

**Key insight:** The existing codebase already has established patterns for all these concerns. Follow them exactly.

## Common Pitfalls

### Pitfall 1: Forgetting database.save() after write operations

**What goes wrong:** Changes appear to succeed but are lost on server restart.

**Why it happens:** sql.js is in-memory; changes must be explicitly persisted to disk.

**How to avoid:** Always call `database.save()` after INSERT/UPDATE/DELETE operations. See existing pattern in `routes/books.ts` and `routes/highlights.ts`.

**Warning signs:** Data appears in responses but disappears after restart.

### Pitfall 2: Missing CASCADE DELETE consideration

**What goes wrong:** Deleting a collection leaves orphan records in book_collections.

**Why it happens:** Forgetting to add ON DELETE CASCADE to foreign key.

**How to avoid:** Use the exact schema from ROADMAP with CASCADE. Test by creating a collection, adding a book, then deleting the collection.

**Warning signs:** `DELETE FROM collections` succeeds but `SELECT * FROM book_collections` still has references.

### Pitfall 3: Collection filter ignored when category is also selected

**What goes wrong:** User filters by both category and collection but only one filter applies.

**Why it happens:** Not combining filter conditions with AND in computed property or API query.

**How to avoid:** In filteredBooks computed property, chain conditions:
```typescript
let result = books.value;
if (selectedCategory.value) result = result.filter(b => b.category === selectedCategory.value);
if (selectedCollection.value) result = result.filter(b => b.collection_ids?.includes(selectedCollection.value));
```

**Warning signs:** Selecting collection resets category selection in UI.

### Pitfall 4: UNIQUE constraint error not handled

**What goes wrong:** Creating duplicate collection name returns generic 500 error.

**Why it happens:** Not catching SQLITE_CONSTRAINT error code.

**How to avoid:** Follow existing pattern from categories.ts:
```typescript
catch (error: any) {
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ error: 'Collection name already exists' });
  }
  res.status(500).json({ error: 'Failed to create collection' });
}
```

**Warning signs:** Duplicate name attempt shows "Failed to create collection" instead of specific message.

## Code Examples

### Backend: Collection Route (Complete)

```typescript
// backend/src/routes/collections.ts
import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { collectionSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// GET /api/collections - List all with book counts
router.get('/', (req, res) => {
  try {
    const database = db();
    const collections = database.all(`
      SELECT c.*, COUNT(bc.book_id) as book_count
      FROM collections c
      LEFT JOIN book_collections bc ON c.id = bc.collection_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(collections);
  } catch (error) {
    console.error('Failed to get collections:', error);
    res.status(500).json({ error: 'Failed to get collections' });
  }
});

// POST /api/collections - Create new collection
router.post('/', authMiddleware, validateBody(collectionSchema), (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO collections (name, description, icon, color) VALUES (?, ?, ?, ?)',
      [name, description || null, icon || null, color || null]
    );
    database.save();
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      description: description || null,
      icon: icon || null,
      color: color || null,
      book_count: 0
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '收藏夹名称已存在' });
    }
    console.error('Failed to create collection:', error);
    res.status(500).json({ error: '创建收藏夹失败' });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const { name, description, icon, color } = req.body;
    const database = db();

    const existing = database.get('SELECT * FROM collections WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '收藏夹不存在' });
    }

    database.run(
      'UPDATE collections SET name = ?, description = ?, icon = ?, color = ? WHERE id = ?',
      [name, description || null, icon || null, color || null, id]
    );
    database.save();

    const updated = database.get(`
      SELECT c.*, COUNT(bc.book_id) as book_count
      FROM collections c
      LEFT JOIN book_collections bc ON c.id = bc.collection_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '收藏夹名称已存在' });
    }
    console.error('Failed to update collection:', error);
    res.status(500).json({ error: '更新收藏夹失败' });
  }
});

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const existing = database.get('SELECT * FROM collections WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '收藏夹不存在' });
    }

    // CASCADE will automatically delete book_collections entries
    database.run('DELETE FROM collections WHERE id = ?', [id]);
    database.save();
    res.json({ success: true, message: '收藏夹已删除' });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    res.status(500).json({ error: '删除收藏夹失败' });
  }
});

// POST /api/collections/:id/books/:bookId - Add book to collection
router.post('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id, bookId } = req.params as any;
    const database = db();

    // Verify book and collection exist
    const book = database.get('SELECT id FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    const collection = database.get('SELECT id FROM collections WHERE id = ?', [id]);
    if (!collection) {
      return res.status(404).json({ error: '收藏夹不存在' });
    }

    // Insert (ignore if already exists - PRIMARY KEY handles duplicates)
    try {
      database.run(
        'INSERT INTO book_collections (book_id, collection_id) VALUES (?, ?)',
        [bookId, id]
      );
      database.save();
    } catch (e: any) {
      if (e.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw e;
      // Already in collection - idempotent success
    }

    res.status(201).json({ success: true, message: '已添加到收藏夹' });
  } catch (error) {
    console.error('Failed to add book to collection:', error);
    res.status(500).json({ error: '添加到收藏夹失败' });
  }
});

// DELETE /api/collections/:id/books/:bookId - Remove book from collection
router.delete('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id, bookId } = req.params as any;
    const database = db();

    database.run(
      'DELETE FROM book_collections WHERE collection_id = ? AND book_id = ?',
      [id, bookId]
    );
    database.save();
    res.json({ success: true, message: '已从收藏夹移除' });
  } catch (error) {
    console.error('Failed to remove book from collection:', error);
    res.status(500).json({ error: '从收藏夹移除失败' });
  }
});

export default router;
```

### Backend: Books Route Modification

```typescript
// backend/src/routes/books.ts - Add collection filter support
// Modify the GET / route:

router.get('/', validateQuery(bookQuerySchema), (req, res) => {
  const { page = 1, limit = 20, search, collection_id } = req.query as any;
  const offset = (page - 1) * limit;
  const database = db();

  let sql = `
    SELECT DISTINCT b.*
    FROM books b
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (search) {
    conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (collection_id) {
    sql += `
      JOIN book_collections bc ON b.id = bc.book_id
    `;
    conditions.push('bc.collection_id = ?');
    params.push(collection_id);
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
  if (collection_id) {
    countSql += ' JOIN book_collections bc ON b.id = bc.book_id';
  }
  if (search) {
    countSql += ' WHERE (b.title LIKE ? OR b.author LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
  }
  if (collection_id && search) {
    countSql += ' WHERE bc.collection_id = ?';
    countParams.push(collection_id);
  } else if (collection_id) {
    countSql += ' WHERE bc.collection_id = ?';
    countParams.push(collection_id);
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
// backend/src/validators/schemas.ts - Add collection schemas

// Collection schema
export const collectionSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过100字符'),
  description: z.string().max(500, '描述不能超过500字符').optional(),
  icon: z.string().max(10, '图标不能超过10字符').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$|^$/, '颜色格式无效').optional(),
});

// Book query schema update
export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.coerce.number().int().positive().optional(),
  collection_id: z.coerce.number().int().positive().optional(), // NEW
});

// Type exports
export type CollectionInput = z.infer<typeof collectionSchema>;
```

### Backend: Database Schema Addition

```typescript
// backend/src/models/book.ts - Add to initDatabase function

// Add after highlights table creation
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

// Add indexes
dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_collections_book ON book_collections(book_id)`);
dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_book_collections_collection ON book_collections(collection_id)`);
```

### Frontend: Collection API Client

```typescript
// frontend/src/api/collections.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Collection {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  book_count: number;
  created_at: string;
}

export async function getCollections(): Promise<Collection[]> {
  const response = await api.get('/collections');
  return response.data;
}

export async function createCollection(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Collection> {
  const response = await api.post('/collections', data);
  return response.data;
}

export async function updateCollection(
  id: number,
  data: { name: string; description?: string; icon?: string; color?: string }
): Promise<Collection> {
  const response = await api.put(`/collections/${id}`, data);
  return response.data;
}

export async function deleteCollection(id: number): Promise<void> {
  await api.delete(`/collections/${id}`);
}

export async function addBookToCollection(collectionId: number, bookId: number): Promise<void> {
  await api.post(`/collections/${collectionId}/books/${bookId}`);
}

export async function removeBookFromCollection(collectionId: number, bookId: number): Promise<void> {
  await api.delete(`/collections/${collectionId}/books/${bookId}`);
}
```

### Frontend: Library.vue Modification

```vue
<!-- frontend/src/views/Library.vue - Add collection filter -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import BookCard from '../components/BookCard.vue';
import { getBooks, getCategories, type Book, type Category } from '../api/books';
import { getCollections, type Collection } from '../api/collections';
import { getReadingHistory } from '../api/reading';

const router = useRouter();

const books = ref<Book[]>([]);
const categories = ref<Category[]>([]);
const collections = ref<Collection[]>([]);
const readingHistory = ref<any[]>([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedCollection = ref<number | null>(null);

const filteredBooks = computed(() => {
  let result = books.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(book =>
      book.title.toLowerCase().includes(query) ||
      (book.author && book.author.toLowerCase().includes(query))
    );
  }

  if (selectedCategory.value) {
    result = result.filter(book => book.category === selectedCategory.value);
  }

  // Collection filtering is handled server-side when selectedCollection is set
  // This computed property is for client-side filtering when not using server filter
  return result;
});

async function loadData() {
  try {
    const [booksData, categoriesData, collectionsData, historyData] = await Promise.all([
      getBooks(),
      getCategories(),
      getCollections(),
      getReadingHistory()
    ]);
    books.value = booksData;
    categories.value = categoriesData;
    collections.value = collectionsData;
    readingHistory.value = historyData;
  } catch (error) {
    console.error('Failed to load library data:', error);
  }
}

// Handle collection filter change - fetch filtered books from server
async function handleCollectionChange() {
  if (selectedCollection.value) {
    const booksData = await getBooks(undefined, selectedCollection.value);
    books.value = booksData;
  } else {
    const booksData = await getBooks();
    books.value = booksData;
  }
}

onMounted(() => {
  loadData();
});
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| In-memory SQLite without persistence | sql.js with file persistence | Project start | Data survives restarts |
| Manual validation | Zod schema validation | v0.2 | Type-safe request parsing |
| No validation middleware | validateBody/validateQuery middleware | v0.2 | Consistent error responses |

**Deprecated/outdated:**
- Hardcoded admin password: Replaced with JWT auth in v0.2
- Direct SQL without prepared statements: Never used, project started with prepared statements

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Icon will be stored as emoji string (e.g., '📁') | Code Examples | May need longer field if using icon library |
| A2 | Color will be hex format (#RRGGBB) | Code Examples | May need to support named colors or RGB |
| A3 | CASCADE DELETE is sufficient for removing book from collection | Database Schema | Complex cleanup may be needed if additional constraints exist |

## Open Questions

1. **Icon selection UI**
   - What we know: Icon field is TEXT, ROADMAP shows it as optional
   - What's unclear: Should frontend use emoji picker or predefined list?
   - Recommendation: Start with predefined emoji list (📁📚⭐❤️🔖etc.) in a dropdown; can enhance later

2. **Color picker UI**
   - What we know: Color field is TEXT, ROADMAP shows it as optional
   - What's unclear: Should use native color input or predefined palette?
   - Recommendation: Use predefined palette of 8-10 colors for simplicity; native color input if user requests more

3. **Collection assignment location**
   - What we know: BookDetail.vue has existing edit section for category/tags
   - What's unclear: Should collection assignment be multi-select dropdown or checkbox list?
   - Recommendation: Multi-select dropdown showing all collections with checkmarks, similar to tag selection pattern

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | ES2022 target | — |
| sql.js | Database | ✓ | ^1.9.0 | — |
| Express | API | ✓ | 4.18.2 | — |
| Vue 3 | Frontend | ✓ | 3.4.21 | — |
| Zod | Validation | ✓ | ^3.22.4 | — |

**Missing dependencies with no fallback:** None — all dependencies are already in the project.

**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (detected in backend) |
| Config file | backend/package.json scripts |
| Quick run command | `cd backend && npm test -- --testPathPattern=collections` |
| Full suite command | `cd backend && npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COLL-01 | Create, delete, rename collection | unit | `npm test -- --testPathPattern=collections` | ❌ Wave 0 |
| COLL-02 | Set icon and color for collection | unit | `npm test -- --testPathPattern=collections` | ❌ Wave 0 |
| COLL-03 | Add book to collection (many-to-many) | integration | `npm test -- --testPathPattern=book-collections` | ❌ Wave 0 |
| COLL-04 | Remove book from collection | integration | `npm test -- --testPathPattern=book-collections` | ❌ Wave 0 |
| COLL-05 | Filter books by collection | integration | `npm test -- --testPathPattern=books-filter` | ❌ Wave 0 |
| COLL-06 | Display book count per collection | unit | `npm test -- --testPathPattern=collections-count` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<feature>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `backend/src/__tests__/collections.test.ts` — covers COLL-01, COLL-02, COLL-06
- [ ] `backend/src/__tests__/book-collections.test.ts` — covers COLL-03, COLL-04
- [ ] `backend/src/__tests__/books-filter.test.ts` — covers COLL-05
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
- ROADMAP.md Phase 14 specification (VERIFIED: file read)
- Existing patterns from categories.ts, books.ts, highlights.ts (VERIFIED: codebase)

### Secondary (MEDIUM confidence)
- None needed — all patterns exist in codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use
- Architecture: HIGH - Follows existing patterns exactly
- Pitfalls: HIGH - Based on codebase analysis

**Research date:** 2026-05-14
**Valid until:** 30 days (stable patterns)

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COLL-01 | 创建、删除、重命名收藏夹 | Standard CRUD pattern from categories.ts; Zod validation; Express Router |
| COLL-02 | 收藏夹图标和颜色设置 | TEXT fields in collections table; icon/color optional; UI patterns from BookDetail.vue |
| COLL-03 | 书籍添加到收藏夹（多对多） | Junction table book_collections; POST /collections/:id/books/:bookId endpoint |
| COLL-04 | 从收藏夹移除书籍 | DELETE /collections/:id/books/:bookId; CASCADE handles cleanup |
| COLL-05 | 按收藏夹筛选书籍列表 | Modify GET /books to accept collection_id param; SQL JOIN with book_collections |
| COLL-06 | 收藏夹列表显示书籍数量 | SQL LEFT JOIN with COUNT aggregate in GET /collections |
