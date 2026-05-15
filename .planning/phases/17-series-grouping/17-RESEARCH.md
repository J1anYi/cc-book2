# Phase 17: 系列分组 (Series Grouping) - Research

**Researched:** 2026-05-15
**Domain:** Series Management with One-to-Many Relationship and Auto-Detection
**Confidence:** HIGH

## Summary

This phase implements a series grouping system that allows users to organize books into named series with ordered positions. The core technical challenges are: (1) creating the series table and adding series_id/series_index columns to books, (2) implementing series ordering with REAL index values for flexible reordering, (3) adding series filtering to the existing filter bar, and (4) optionally implementing auto-detection of series information from book titles using pattern matching. The implementation follows established patterns from Phase 14-16: Express Router for API routes, Zod for validation, sql.js for database operations, and Vue 3 Composition API for frontend components.

**Primary recommendation:** Implement series as a separate route module (`series.ts`) following the collections pattern, with direct foreign key columns (series_id, series_index) on the books table for the one-to-many relationship. Use REAL for series_index to allow fractional values for easy reordering without bulk updates. Add optional auto-detection utility for extracting series info from book titles.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Series CRUD (create/update/delete) | API / Backend | — | Business logic and data persistence |
| Book-to-series assignment | API / Backend | — | One-to-many relationship management |
| Series list retrieval with book counts | API / Backend | — | Requires SQL JOIN/aggregate queries |
| Series filter UI | Browser / Client | — | UI interaction and state management |
| Series management UI | Browser / Client | — | CRUD forms and dialogs |
| Auto-detection of series info | API / Backend | — | Pattern matching on book titles |

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
| series_id/series_index columns | Junction table | Simpler for one-to-many; junction table would be overkill |
| REAL for series_index | INTEGER | REAL allows fractional values for easy reordering (insert between 1 and 2 as 1.5) |
| Server-side filtering | Client-side filtering | Server-side scales better for large book counts |
| Regex pattern matching | NLP library | Regex is sufficient for common patterns; NLP would be overkill |

**Version verification:** Versions confirmed via existing codebase (Express 5.2.1, Zod 4.4.3).

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser / Client                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Library.vue                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ Search Box  │  │ Collection  │  │ Series Filter (NEW)         │  │    │
│  │  │             │  │ Dropdown    │  │  - Series list              │  │    │
│  │  │             │  │             │  │  - Book count per series    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │    │
│  │                          │                      │                    │    │
│  │                          ▼                      ▼                    │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │  BookGrid (filtered by series, ordered by series_index)        │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                              GET /api/books?series_id=X                      │
│                              GET /api/series                                 │
│                                    │                                         │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTP/JSON
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API / Backend                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  routes/series.ts (NEW)                                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ GET /       │  │ POST /      │  │ PUT /:id                    │  │    │
│  │  │ List with   │  │ Create      │  │ Update name/description     │  │    │
│  │  │ book counts │  │ series      │  │                             │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │    │
│  │  ┌─────────────┐  ┌─────────────────────────────────────────────┐  │    │
│  │  │ DELETE /:id │  │ POST /detect                               │  │    │
│  │  │ Delete      │  │ Auto-detect series info from titles        │  │    │
│  │  │ series      │  │                                             │  │    │
│  │  └─────────────┘  └─────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  models/book.ts                                                      │    │
│  │  - series table: id, name, description, created_at                  │    │
│  │  - books.series_id: FK to series                                    │    │
│  │  - books.series_index: REAL for ordering within series              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
backend/src/
├── routes/
│   ├── series.ts           # NEW: Series CRUD + auto-detection
│   ├── books.ts            # MODIFY: Add series_id query param + series assignment
│   └── ...
├── models/
│   └── book.ts             # MODIFY: Add series table + series_id/series_index columns
├── validators/
│   └── schemas.ts          # MODIFY: Add series validation schemas
├── utils/
│   └── seriesDetection.ts  # NEW: Auto-detection utility (optional)
└── index.ts                # MODIFY: Register series router

frontend/src/
├── api/
│   ├── books.ts            # MODIFY: Add series API functions
│   └── series.ts           # NEW: Series API client
├── views/
│   ├── Library.vue         # MODIFY: Add series filter
│   └── BookDetail.vue      # MODIFY: Add series assignment UI
├── components/
│   └── SeriesManager.vue   # NEW: Series CRUD UI (optional modal)
└── types/
    └── series.ts           # NEW: TypeScript interfaces
```

### Pattern 1: One-to-Many with Foreign Key Columns

**What:** Use direct foreign key columns on the books table instead of a junction table.

**When to use:** When each book can belong to at most one series (one-to-many relationship).

**Why not junction table:** Junction tables are for many-to-many relationships. Since a book can only be in one series, direct FK columns are simpler and more efficient.

**Example:**
```sql
-- Source: [ROADMAP.md - Phase 17 Technical Notes]
CREATE TABLE series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to existing books table
ALTER TABLE books ADD COLUMN series_id INTEGER REFERENCES series(id) ON DELETE SET NULL;
ALTER TABLE books ADD COLUMN series_index REAL; -- REAL allows fractional values for reordering
```

### Pattern 2: REAL Index for Flexible Reordering

**What:** Use REAL (floating-point) for series_index instead of INTEGER.

**When to use:** When users need to reorder items without bulk updates.

**Why:** With INTEGER, inserting between items 1 and 2 requires renumbering all subsequent items. With REAL, you can use 1.5.

**Example:**
```typescript
// Insert between items at index 1 and 2
const newIndex = (1 + 2) / 2; // 1.5

// Move to end of series
const maxIndex = database.get(
  'SELECT MAX(series_index) as max FROM books WHERE series_id = ?',
  [seriesId]
);
const newIndex = (maxIndex.max || 0) + 1;
```

### Pattern 3: ALTER TABLE for Adding Columns

**What:** Use ALTER TABLE ADD COLUMN to add series_id and series_index to existing books table.

**When to use:** Adding new columns to existing tables without data loss.

**Example:**
```typescript
// In models/book.ts initDatabase(), after existing table creation:
const columns = dbInstance.all("PRAGMA table_info(books)");
const hasSeriesId = columns.some((col: any) => col.name === 'series_id');
if (!hasSeriesId) {
  dbInstance.exec(`ALTER TABLE books ADD COLUMN series_id INTEGER REFERENCES series(id) ON DELETE SET NULL`);
}

const hasSeriesIndex = columns.some((col: any) => col.name === 'series_index');
if (!hasSeriesIndex) {
  dbInstance.exec(`ALTER TABLE books ADD COLUMN series_index REAL`);
}
```

### Pattern 4: Auto-Detection with Regex Patterns

**What:** Use regex patterns to extract series name and index from book titles.

**When to use:** Optional feature to help users quickly assign books to series.

**Patterns to detect:**
```typescript
// Pattern 1: "XXX 第N卷" or "XXX 第N部"
const chineseVolumePattern = /^(.+?)\s*第(\d+)[卷部]/;

// Pattern 2: "XXX Vol.N" or "XXX Volume N"
const englishVolumePattern = /^(.+?)\s*(?:Vol\.?|Volume)\s*(\d+)/i;

// Pattern 3: "XXX #N" or "XXX N" (number suffix)
const numberSuffixPattern = /^(.+?)\s*[#＃]?\s*(\d+)$/;

// Pattern 4: "XXX (N)" or "XXX（N）" (number in parentheses)
const parenthesesPattern = /^(.+?)\s*[（(]\s*(\d+)\s*[）)]/;

function detectSeriesInfo(title: string): { seriesName: string; index: number } | null {
  // Try each pattern in order
  for (const pattern of [
    chineseVolumePattern,
    englishVolumePattern,
    parenthesesPattern,
    numberSuffixPattern
  ]) {
    const match = title.match(pattern);
    if (match) {
      return {
        seriesName: match[1].trim(),
        index: parseInt(match[2], 10)
      };
    }
  }
  return null;
}
```

### Anti-Patterns to Avoid

- **Using a junction table for one-to-many:** Overkill; direct FK columns are simpler and more efficient
- **INTEGER for series_index:** Requires bulk renumbering when inserting between items
- **Client-side series filtering:** Will not scale as book count grows; server should handle filtering
- **N+1 query for book counts:** Use JOIN with COUNT aggregate instead of separate queries per series
- **Auto-detection without user confirmation:** May incorrectly detect series; always require user confirmation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Series name uniqueness | Manual check before insert | SQLite UNIQUE constraint | Race condition protection, simpler code |
| Book count per series | Separate COUNT queries | SQL JOIN with GROUP BY | Single query, better performance |
| Column existence check | Try/catch ALTER TABLE | PRAGMA table_info | Cleaner code, no error handling needed |
| Request validation | Manual if/else checks | Zod schemas with validateBody middleware | Consistent error format, type safety |
| Series reordering | Renumber all items | REAL index with fractional values | O(1) instead of O(n) |

**Key insight:** The existing codebase already has established patterns for all these concerns from Phase 14-16. Follow them exactly.

## Common Pitfalls

### Pitfall 1: Forgetting database.save() after write operations

**What goes wrong:** Changes appear to succeed but are lost on server restart.

**Why it happens:** sql.js is in-memory; changes must be explicitly persisted to disk.

**How to avoid:** Always call `database.save()` after INSERT/UPDATE/DELETE operations. See existing pattern in `routes/books.ts` and `routes/collections.ts`.

**Warning signs:** Data appears in responses but disappears after restart.

### Pitfall 2: Using INTEGER for series_index

**What goes wrong:** Reordering books in a series requires updating multiple rows.

**Why it happens:** With INTEGER, inserting between items 1 and 2 requires renumbering all items ≥ 2.

**How to avoid:** Use REAL for series_index. Insert between items using average: `(index1 + index2) / 2`.

**Warning signs:** Drag-and-drop reordering is slow for large series; bulk updates fail intermittently.

### Pitfall 3: Series filter ignored when other filters are active

**What goes wrong:** User filters by series and collection but only one filter applies.

**Why it happens:** Not combining filter conditions with AND in SQL query.

**How to avoid:** Chain conditions properly in the WHERE clause:
```typescript
if (conditions.length > 0) {
  sql += ' WHERE ' + conditions.join(' AND ');
}
```

**Warning signs:** Selecting series resets collection selection in UI, or vice versa.

### Pitfall 4: UNIQUE constraint error not handled

**What goes wrong:** Creating duplicate series name returns generic 500 error.

**Why it happens:** Not catching SQLITE_CONSTRAINT error code.

**How to avoid:** Follow existing pattern from collections.ts:
```typescript
catch (error: any) {
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ error: '系列名称已存在' });
  }
  res.status(500).json({ error: '创建系列失败' });
}
```

**Warning signs:** Duplicate name attempt shows "创建系列失败" instead of specific message.

### Pitfall 5: Auto-detection false positives

**What goes wrong:** Books with numbers in titles are incorrectly assigned to series.

**Why it happens:** Pattern matching is too aggressive; "1984" or "2001: A Space Odyssey" match number suffix pattern.

**How to avoid:** 
1. Only auto-detect when user explicitly requests it
2. Show preview before applying
3. Add exclusion rules for common false positives (years, dates)

**Warning signs:** Single books are incorrectly grouped into series; year numbers trigger false detection.

## Code Examples

### Backend: Series Route (Complete)

```typescript
// backend/src/routes/series.ts
import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { seriesSchema, idParamSchema, setBookSeriesSchema } from '../validators/schemas.js';
import { detectSeriesInfo } from '../utils/seriesDetection.js';

const router = Router();

// GET /api/series - List all series with book counts
router.get('/', (req, res) => {
  try {
    const database = db();
    const series = database.all(`
      SELECT 
        s.*, 
        COUNT(b.id) as book_count,
        MIN(b.series_index) as min_index,
        MAX(b.series_index) as max_index
      FROM series s
      LEFT JOIN books b ON b.series_id = s.id
      GROUP BY s.id
      ORDER BY s.name
    `);
    res.json(series);
  } catch (error) {
    console.error('Failed to get series:', error);
    res.status(500).json({ error: '获取系列列表失败' });
  }
});

// GET /api/series/:id - Get series with books in order
router.get('/:id', validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const series = database.get('SELECT * FROM series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: '系列不存在' });
    }

    const books = database.all(`
      SELECT * FROM books
      WHERE series_id = ?
      ORDER BY series_index ASC, created_at ASC
    `, [id]);

    res.json({ ...series, books });
  } catch (error) {
    console.error('Failed to get series:', error);
    res.status(500).json({ error: '获取系列详情失败' });
  }
});

// POST /api/series - Create new series
router.post('/', authMiddleware, validateBody(seriesSchema), (req, res) => {
  try {
    const { name, description } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO series (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    database.save();
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      description: description || null,
      book_count: 0
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '系列名称已存在' });
    }
    console.error('Failed to create series:', error);
    res.status(500).json({ error: '创建系列失败' });
  }
});

// PUT /api/series/:id - Update series
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(seriesSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const { name, description } = req.body;
    const database = db();

    const existing = database.get('SELECT * FROM series WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '系列不存在' });
    }

    database.run(
      'UPDATE series SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    database.save();

    const updated = database.get(`
      SELECT 
        s.*, 
        COUNT(b.id) as book_count
      FROM series s
      LEFT JOIN books b ON b.series_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '系列名称已存在' });
    }
    console.error('Failed to update series:', error);
    res.status(500).json({ error: '更新系列失败' });
  }
});

// DELETE /api/series/:id - Delete series (books' series_id set to NULL via ON DELETE SET NULL)
router.delete('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const existing = database.get('SELECT * FROM series WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '系列不存在' });
    }

    // ON DELETE SET NULL will automatically clear series_id on books
    database.run('DELETE FROM series WHERE id = ?', [id]);
    database.save();
    res.json({ success: true, message: '系列已删除' });
  } catch (error) {
    console.error('Failed to delete series:', error);
    res.status(500).json({ error: '删除系列失败' });
  }
});

// PUT /api/series/:id/books/:bookId - Add book to series
router.put('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id, bookId } = req.params as any;
    const { index } = req.body;
    const database = db();

    // Verify book exists
    const book = database.get('SELECT id, series_id FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    // Verify series exists
    const series = database.get('SELECT id FROM series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: '系列不存在' });
    }

    // Calculate index if not provided
    let seriesIndex = index;
    if (seriesIndex === undefined || seriesIndex === null) {
      const maxIndex = database.get(
        'SELECT MAX(series_index) as max FROM books WHERE series_id = ?',
        [id]
      );
      seriesIndex = (maxIndex.max || 0) + 1;
    }

    database.run(
      'UPDATE books SET series_id = ?, series_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id, seriesIndex, bookId]
    );
    database.save();

    const updatedBook = database.get('SELECT * FROM books WHERE id = ?', [bookId]);
    res.json(updatedBook);
  } catch (error) {
    console.error('Failed to add book to series:', error);
    res.status(500).json({ error: '添加到系列失败' });
  }
});

// DELETE /api/series/:id/books/:bookId - Remove book from series
router.delete('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { bookId } = req.params as any;
    const database = db();

    database.run(
      'UPDATE books SET series_id = NULL, series_index = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [bookId]
    );
    database.save();
    res.json({ success: true, message: '已从系列移除' });
  } catch (error) {
    console.error('Failed to remove book from series:', error);
    res.status(500).json({ error: '从系列移除失败' });
  }
});

// POST /api/series/detect - Auto-detect series info from book titles
router.post('/detect', authMiddleware, (req, res) => {
  try {
    const { bookIds } = req.body;
    const database = db();

    const results: Array<{
      bookId: number;
      title: string;
      detected: { seriesName: string; index: number } | null;
    }> = [];

    for (const bookId of bookIds) {
      const book = database.get('SELECT id, title FROM books WHERE id = ?', [bookId]);
      if (book) {
        const detected = detectSeriesInfo(book.title);
        results.push({
          bookId: book.id,
          title: book.title,
          detected
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Failed to detect series info:', error);
    res.status(500).json({ error: '检测系列信息失败' });
  }
});

// POST /api/series/reorder - Reorder books within a series
router.post('/reorder', authMiddleware, (req, res) => {
  try {
    const { seriesId, bookIds } = req.body; // bookIds in new order
    const database = db();

    // Assign new indices (1, 2, 3, ...)
    for (let i = 0; i < bookIds.length; i++) {
      database.run(
        'UPDATE books SET series_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND series_id = ?',
        [i + 1, bookIds[i], seriesId]
      );
    }
    database.save();

    const books = database.all(
      'SELECT * FROM books WHERE series_id = ? ORDER BY series_index ASC',
      [seriesId]
    );
    res.json(books);
  } catch (error) {
    console.error('Failed to reorder series:', error);
    res.status(500).json({ error: '重新排序失败' });
  }
});

export default router;
```

### Backend: Series Detection Utility

```typescript
// backend/src/utils/seriesDetection.ts

// Patterns for detecting series info from book titles
const patterns = [
  // Chinese: "XXX 第N卷" or "XXX 第N部"
  /^(.+?)\s*第(\d+)[卷部册]/,
  
  // English: "XXX Vol.N" or "XXX Volume N"
  /^(.+?)\s*(?:Vol\.?|Volume)\s*(\d+)/i,
  
  // Number in parentheses: "XXX (N)" or "XXX（N）"
  /^(.+?)\s*[（(]\s*(\d+)\s*[）)]/,
  
  // Hash prefix: "XXX #N"
  /^(.+?)\s*[#＃]\s*(\d+)/,
];

// Exclusion patterns to avoid false positives
const exclusionPatterns = [
  /^\d{4}$/, // Years like "1984", "2001"
  /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, // Dates
];

export function detectSeriesInfo(title: string): { seriesName: string; index: number } | null {
  // Check exclusions first
  for (const pattern of exclusionPatterns) {
    if (pattern.test(title)) {
      return null;
    }
  }

  // Try each detection pattern
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const seriesName = match[1].trim();
      const index = parseInt(match[2], 10);
      
      // Sanity checks
      if (seriesName.length < 2 || seriesName.length > 100) continue;
      if (index < 1 || index > 999) continue;
      
      return { seriesName, index };
    }
  }

  return null;
}

// Batch detection for multiple books
export function batchDetectSeries(
  titles: string[]
): Array<{ title: string; detected: { seriesName: string; index: number } | null }> {
  return titles.map(title => ({
    title,
    detected: detectSeriesInfo(title)
  }));
}
```

### Backend: Books Route Modification

```typescript
// backend/src/routes/books.ts - Add series filter support
// Modify the GET / route:

router.get('/', validateQuery(bookQuerySchema), (req, res) => {
  const { page = 1, limit = 20, search, collection_id, status, tags, tagMode = 'OR', series_id } = req.query as any;
  const offset = (page - 1) * limit;
  const database = db();

  let sql = 'SELECT DISTINCT b.* FROM books b';
  const params: any[] = [];
  const conditions: string[] = [];

  // ... existing filters (collection_id, search, status, tags) ...

  // NEW: Series filter
  if (series_id) {
    conditions.push('b.series_id = ?');
    params.push(series_id);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Order by series_index if filtering by series, otherwise by created_at
  if (series_id) {
    sql += ' ORDER BY b.series_index ASC, b.created_at DESC';
  } else {
    sql += ' ORDER BY b.created_at DESC';
  }
  
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const books = database.all(sql, params);

  // ... count query with same logic ...

  res.json({ data: books, pagination: { page, limit, total: totalResult.total, totalPages, hasMore: page < totalPages } });
});

// Add endpoint for setting book series
router.put('/:id/series', validateParams(idParamSchema), validateBody(setBookSeriesSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const { seriesId, seriesIndex } = req.body;
    const database = db();

    const book = database.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    // If seriesId is null, remove from series
    if (seriesId === null) {
      database.run(
        'UPDATE books SET series_id = NULL, series_index = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
    } else {
      // Verify series exists
      const series = database.get('SELECT id FROM series WHERE id = ?', [seriesId]);
      if (!series) {
        return res.status(404).json({ error: '系列不存在' });
      }

      // Calculate index if not provided
      let index = seriesIndex;
      if (index === undefined || index === null) {
        const maxIndex = database.get(
          'SELECT MAX(series_index) as max FROM books WHERE series_id = ?',
          [seriesId]
        );
        index = (maxIndex.max || 0) + 1;
      }

      database.run(
        'UPDATE books SET series_id = ?, series_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [seriesId, index, id]
      );
    }

    await database.save();

    const updatedBook = database.get('SELECT * FROM books WHERE id = ?', [id]);
    res.json(updatedBook);
  } catch (error) {
    console.error('Update series error:', error);
    res.status(500).json({ error: '设置系列失败' });
  }
});
```

### Backend: Zod Schema Addition

```typescript
// backend/src/validators/schemas.ts - Add series schemas

// Series schema
export const seriesSchema = z.object({
  name: z.string().min(1, '系列名称不能为空').max(100, '系列名称不能超过100字符'),
  description: z.string().max(500, '描述不能超过500字符').optional(),
});

// Set book series schema
export const setBookSeriesSchema = z.object({
  seriesId: z.number().int().positive().nullable(),
  seriesIndex: z.number().positive().optional(),
});

// Book query schema update
export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.coerce.number().int().positive().optional(),
  collection_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['want_to_read', 'reading', 'read']).optional(),
  tags: z.string().optional(),
  tagMode: z.enum(['AND', 'OR']).default('OR'),
  series_id: z.coerce.number().int().positive().optional(), // NEW
});

// Type exports
export type SeriesInput = z.infer<typeof seriesSchema>;
export type SetBookSeriesInput = z.infer<typeof setBookSeriesSchema>;
```

### Backend: Database Schema Addition

```typescript
// backend/src/models/book.ts - Add to initDatabase function

// Create series table
dbInstance.exec(`
  CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add series_id column to books table if it doesn't exist
const columns = dbInstance.all("PRAGMA table_info(books)");
const hasSeriesId = columns.some((col: any) => col.name === 'series_id');
if (!hasSeriesId) {
  dbInstance.exec(`ALTER TABLE books ADD COLUMN series_id INTEGER REFERENCES series(id) ON DELETE SET NULL`);
}

const hasSeriesIndex = columns.some((col: any) => col.name === 'series_index');
if (!hasSeriesIndex) {
  dbInstance.exec(`ALTER TABLE books ADD COLUMN series_index REAL`);
}

// Add indexes
dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_books_series ON books(series_id)`);
```

### Frontend: Series API Client

```typescript
// frontend/src/api/series.ts
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

export interface Series {
  id: number;
  name: string;
  description: string | null;
  book_count: number;
  min_index: number | null;
  max_index: number | null;
  created_at: string;
}

export interface SeriesWithBooks extends Series {
  books: Book[];
}

export interface Book {
  id: number;
  title: string;
  author: string | null;
  series_id: number | null;
  series_index: number | null;
  // ... other fields
}

export interface DetectionResult {
  bookId: number;
  title: string;
  detected: {
    seriesName: string;
    index: number;
  } | null;
}

export async function getSeries(): Promise<Series[]> {
  const response = await api.get('/series');
  return response.data;
}

export async function getSeriesById(id: number): Promise<SeriesWithBooks> {
  const response = await api.get(`/series/${id}`);
  return response.data;
}

export async function createSeries(data: {
  name: string;
  description?: string;
}): Promise<Series> {
  const response = await api.post('/series', data);
  return response.data;
}

export async function updateSeries(
  id: number,
  data: { name: string; description?: string }
): Promise<Series> {
  const response = await api.put(`/series/${id}`, data);
  return response.data;
}

export async function deleteSeries(id: number): Promise<void> {
  await api.delete(`/series/${id}`);
}

export async function addBookToSeries(
  seriesId: number,
  bookId: number,
  index?: number
): Promise<Book> {
  const response = await api.put(`/series/${seriesId}/books/${bookId}`, { index });
  return response.data;
}

export async function removeBookFromSeries(
  seriesId: number,
  bookId: number
): Promise<void> {
  await api.delete(`/series/${seriesId}/books/${bookId}`);
}

export async function detectSeriesInfo(bookIds: number[]): Promise<DetectionResult[]> {
  const response = await api.post('/series/detect', { bookIds });
  return response.data;
}

export async function reorderSeries(
  seriesId: number,
  bookIds: number[]
): Promise<Book[]> {
  const response = await api.post('/series/reorder', { seriesId, bookIds });
  return response.data;
}
```

### Frontend: Library.vue Modification (Series Filter)

```vue
<!-- frontend/src/views/Library.vue - Add series filter -->
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
      
      <!-- NEW: Series filter -->
      <div class="filter-box">
        <select v-model="selectedSeries" @change="handleSeriesChange">
          <option :value="null">全部系列</option>
          <option v-for="ser in seriesList" :key="ser.id" :value="ser.id">
            📚 {{ ser.name }} ({{ ser.book_count }})
          </option>
        </select>
      </div>
    </div>
    
    <!-- Tag filter (existing) -->
    <div class="tag-filter-box">...</div>
    
    <!-- Book grid -->
    <section class="book-grid-section">
      <h2>
        <span class="section-icon">📚</span>
        {{ selectedSeries ? seriesList.find(s => s.id === selectedSeries)?.name : '书库' }}
      </h2>
      <!-- ... -->
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBooks, getCategories, type Book, type Category } from '../api/books';
import { getCollections, type Collection } from '../api/collections';
import { getTags, type Tag } from '../api/tags';
import { getSeries, type Series } from '../api/series';
import { getReadingHistory } from '../api/reading';

const books = ref<Book[]>([]);
const categories = ref<Category[]>([]);
const collections = ref<Collection[]>([]);
const seriesList = ref<Series[]>([]); // NEW
const selectedSeries = ref<number | null>(null); // NEW
const tags = ref<Tag[]>([]);
const selectedTags = ref<Set<number>>(new Set());
const tagFilterMode = ref<'AND' | 'OR'>('OR');
const selectedCollection = ref<number | null>(null);
const selectedStatus = ref<string | null>(null);
const searchQuery = ref('');
const readingHistory = ref<any[]>([]);

async function loadData() {
  try {
    const [booksData, categoriesData, collectionsData, seriesData, tagsData, historyData] = await Promise.all([
      getBooks(),
      getCategories(),
      getCollections(),
      getSeries(), // NEW
      getTags(),
      getReadingHistory()
    ]);
    books.value = booksData;
    categories.value = categoriesData;
    collections.value = collectionsData;
    seriesList.value = seriesData; // NEW
    tags.value = tagsData;
    readingHistory.value = historyData;
  } catch (error) {
    console.error('Failed to load library data:', error);
  }
}

async function handleSeriesChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value || undefined,
      selectedStatus.value || undefined,
      tagIds || undefined,
      tagFilterMode.value,
      selectedSeries.value || undefined // NEW
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by series:', error);
  }
}

// Update other filter handlers to include series filter
async function handleCollectionChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value,
      selectedStatus.value || undefined,
      tagIds || undefined,
      tagFilterMode.value,
      selectedSeries.value || undefined
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by collection:', error);
  }
}

// ... similar updates for handleStatusChange, handleTagChange ...

onMounted(() => {
  loadData();
});
</script>
```

### Frontend: BookDetail.vue Modification (Series Assignment)

```vue
<!-- frontend/src/views/BookDetail.vue - Add series assignment -->
<template>
  <div class="book-detail">
    <!-- ... existing template ... -->
    
    <div class="edit-section">
      <h2>
        <span class="section-icon">✏️</span>
        编辑信息
      </h2>
      <div class="edit-form">
        <!-- Existing: category, tags, collections -->
        
        <!-- NEW: Series assignment -->
        <div class="form-group">
          <label>系列</label>
          <div class="series-selector">
            <select v-model="selectedSeriesId" @change="handleSeriesChange">
              <option :value="null">未分配系列</option>
              <option v-for="ser in seriesList" :key="ser.id" :value="ser.id">
                {{ ser.name }}
              </option>
            </select>
            <div v-if="selectedSeriesId" class="series-index-input">
              <label for="seriesIndex">序号:</label>
              <input
                id="seriesIndex"
                type="number"
                v-model.number="seriesIndex"
                min="1"
                step="1"
              />
            </div>
          </div>
          <p v-if="book?.series_id" class="series-hint">
            当前在系列中排序: 第 {{ book.series_index || '?' }} 位
          </p>
        </div>
        
        <button @click="saveEdit" :disabled="saving" class="btn btn-secondary">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getBook, updateBook, type Book } from '../api/books';
import { getSeries, addBookToSeries, removeBookFromSeries, type Series } from '../api/series';
// ... other imports ...

const route = useRoute();
const bookId = computed(() => Number(route.params.id));

const book = ref<Book | null>(null);
const seriesList = ref<Series[]>([]);
const selectedSeriesId = ref<number | null>(null);
const seriesIndex = ref<number | null>(null);

async function loadBook() {
  try {
    loading.value = true;
    
    const [bookData, seriesData] = await Promise.all([
      getBook(bookId.value),
      getSeries()
    ]);
    
    book.value = bookData;
    seriesList.value = seriesData;
    selectedSeriesId.value = bookData.series_id;
    seriesIndex.value = bookData.series_index;
    
    // ... load other data ...
  } catch (err: any) {
    error.value = err.response?.data?.error || '加载失败';
  } finally {
    loading.value = false;
  }
}

async function handleSeriesChange() {
  if (!book.value) return;
  
  try {
    if (selectedSeriesId.value === null) {
      // Remove from series
      await removeBookFromSeries(book.value.series_id!, book.value.id);
      seriesIndex.value = null;
    } else {
      // Add to series (index will be auto-calculated if not set)
      const updated = await addBookToSeries(
        selectedSeriesId.value,
        book.value.id,
        seriesIndex.value || undefined
      );
      seriesIndex.value = updated.series_index;
    }
    
    // Refresh series list to update book counts
    const seriesData = await getSeries();
    seriesList.value = seriesData;
    
    // Refresh book
    const bookData = await getBook(bookId.value);
    book.value = bookData;
  } catch (error) {
    console.error('Failed to update series:', error);
  }
}

// Watch seriesIndex changes and update
watch(seriesIndex, async (newIndex) => {
  if (selectedSeriesId.value && newIndex && book.value) {
    try {
      await addBookToSeries(selectedSeriesId.value, book.value.id, newIndex);
      const bookData = await getBook(bookId.value);
      book.value = bookData;
    } catch (error) {
      console.error('Failed to update series index:', error);
    }
  }
});

onMounted(() => {
  loadBook();
});
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No series grouping | Series table + FK columns | Phase 17 | Organized multi-volume books |
| Manual series assignment | Auto-detection from titles | Phase 17 | Faster series organization |
| INTEGER ordering | REAL index for flexible reordering | Phase 17 | O(1) reordering instead of O(n) |

**Deprecated/outdated:**
- None (new feature)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A book can only belong to one series | Database Schema | May need many-to-many if users request multiple series membership |
| A2 | REAL precision is sufficient for series_index | Database Schema | Extremely unlikely to run out of precision with fractional inserts |
| A3 | Auto-detection is optional and requires confirmation | Requirements | Users may want auto-apply; can be enhanced later |
| A4 | ON DELETE SET NULL is correct behavior | Database Schema | May want CASCADE to delete books when series deleted (unlikely) |

## Open Questions

1. **Series reordering UI**
   - What we know: series_index is REAL for flexible reordering
   - What's unclear: Should UI use drag-and-drop or manual index input?
   - Recommendation: Start with manual index input; drag-and-drop can be added later

2. **Auto-detection scope**
   - What we know: SERI-04 is optional
   - What's unclear: Should detection run on upload or only when user requests?
   - Recommendation: Only on user request; show preview before applying

3. **Series view vs Library view**
   - What we know: Can filter by series in Library
   - What's unclear: Should there be a dedicated Series view showing all series?
   - Recommendation: Filter in Library is sufficient; dedicated view can be added if needed

4. **Series completion tracking**
   - What we know: Series has book_count
   - What's unclear: Should series track "total expected volumes" for completion status?
   - Recommendation: Not in Phase 17; can be future enhancement

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
| Quick run command | `cd backend && npm test -- --testPathPattern=series` |
| Full suite command | `cd backend && npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SERI-01 | Create, delete, rename series | unit | `npm test -- --testPathPattern=series` | ❌ Wave 0 |
| SERI-02 | Assign book to series with order | integration | `npm test -- --testPathPattern=book-series` | ❌ Wave 0 |
| SERI-03 | Filter books by series | integration | `npm test -- --testPathPattern=books-filter` | ❌ Wave 0 |
| SERI-04 | Auto-detect series info | unit | `npm test -- --testPathPattern=series-detection` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<feature>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `backend/src/__tests__/series.test.ts` — covers SERI-01
- [ ] `backend/src/__tests__/book-series.test.ts` — covers SERI-02
- [ ] `backend/src/__tests__/books-filter.test.ts` — covers SERI-03 (extend existing)
- [ ] `backend/src/__tests__/series-detection.test.ts` — covers SERI-04
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
- ROADMAP.md Phase 17 specification (VERIFIED: file read)
- Existing patterns from collections.ts, books.ts (VERIFIED: codebase)
- Phase 14-16 RESEARCH.md (VERIFIED: file reads)

### Secondary (MEDIUM confidence)
- None needed — all patterns exist in codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use
- Architecture: HIGH - Follows existing patterns exactly from Phase 14-16
- Pitfalls: HIGH - Based on codebase analysis and Phase 14-16 experience

**Research date:** 2026-05-15
**Valid until:** 30 days (stable patterns)

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SERI-01 | 创建、删除、重命名系列 | Standard CRUD pattern from collections.ts; Zod validation; Express Router |
| SERI-02 | 书籍分配到系列并设置顺序 | FK columns (series_id, series_index); REAL for flexible reordering; PUT /books/:id/series endpoint |
| SERI-03 | 按系列查看书籍列表 | Modify GET /books to accept series_id param; ORDER BY series_index when filtering |
| SERI-04 | 自动检测系列信息（可选） | Regex patterns for common series naming; POST /series/detect endpoint; preview before apply |

---

## Implementation Checklist

### Backend (backend/src)
- [ ] `models/book.ts`: Add series table creation
- [ ] `models/book.ts`: Add series_id and series_index columns via ALTER TABLE
- [ ] `models/book.ts`: Add index on books(series_id)
- [ ] `validators/schemas.ts`: Add seriesSchema, setBookSeriesSchema
- [ ] `validators/schemas.ts`: Update bookQuerySchema with series_id
- [ ] `routes/series.ts`: Create new route file with CRUD endpoints
- [ ] `routes/series.ts`: Add book assignment endpoint (PUT /:id/books/:bookId)
- [ ] `routes/series.ts`: Add reorder endpoint (POST /reorder)
- [ ] `routes/series.ts`: Add auto-detection endpoint (POST /detect)
- [ ] `routes/books.ts`: Add series_id filter to GET / endpoint
- [ ] `routes/books.ts`: Add PUT /:id/series endpoint
- [ ] `routes/books.ts`: Update ORDER BY to use series_index when filtering by series
- [ ] `utils/seriesDetection.ts`: Create auto-detection utility (optional)
- [ ] `index.ts`: Register series router

### Frontend (frontend/src)
- [ ] `api/series.ts`: Create new API client
- [ ] `api/books.ts`: Add seriesId parameter to getBooks
- [ ] `api/books.ts`: Add setBookSeries function
- [ ] `views/Library.vue`: Add series filter dropdown
- [ ] `views/Library.vue`: Update filter handlers to include series
- [ ] `views/BookDetail.vue`: Add series assignment UI
- [ ] `views/BookDetail.vue`: Add series index input
- [ ] `components/SeriesManager.vue`: Create series management modal (optional)

### Testing
- [ ] `backend/src/__tests__/series.test.ts`: Series CRUD tests
- [ ] `backend/src/__tests__/book-series.test.ts`: Book-series assignment tests
- [ ] `backend/src/__tests__/series-detection.test.ts`: Auto-detection tests

---

*Research complete. Ready for planning.*
