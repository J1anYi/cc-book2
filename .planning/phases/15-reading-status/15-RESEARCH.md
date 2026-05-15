# Research: Phase 15 - 阅读状态 (Reading Status)

**Researched:** 2026-05-15
**Requirements:** STAT-01, STAT-02, STAT-03, STAT-04

---

## 1. Database Schema Changes

### Current Schema (books table)
```sql
CREATE TABLE books (
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
```

### Required Addition
```sql
ALTER TABLE books ADD COLUMN reading_status TEXT DEFAULT 'want_to_read'
  CHECK(reading_status IN ('want_to_read', 'reading', 'read'));
```

### Implementation Notes
- SQLite doesn't support `ADD COLUMN ... CHECK()` directly - need workaround
- **Option A:** Create new table with CHECK constraint, migrate data, rename
- **Option B:** Add column without CHECK, enforce validation in application layer
- **Recommendation:** Use Option B (simpler, validation in Zod schema + API)

### Migration Code Pattern (from Phase 14)
```typescript
// In book.ts initDatabase(), after existing table creation:
dbInstance.exec(`
  CREATE TABLE IF NOT EXISTS collections (...)
`);
```

For reading_status, add after books table creation:
```typescript
// Check if column exists, add if missing
const columns = dbInstance.all("PRAGMA table_info(books)");
const hasStatus = columns.some((col: any) => col.name === 'reading_status');
if (!hasStatus) {
  dbInstance.exec(`ALTER TABLE books ADD COLUMN reading_status TEXT DEFAULT 'want_to_read'`);
}
```

---

## 2. API Endpoints

### New Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| PUT | `/api/books/:id/status` | Update reading status | No (or Yes?) |
| GET | `/api/books?status=reading` | Filter by status | No |

### Endpoint Details

#### PUT /api/books/:id/status
```typescript
// Request
{
  status: 'want_to_read' | 'reading' | 'read'
}

// Response
{
  id: number,
  title: string,
  reading_status: string,
  // ... other book fields
}
```

#### GET /api/books?status=reading
- Add `status` query param to existing `bookQuerySchema`
- Server-side filtering (same pattern as `collection_id` filter)

### Existing Patterns to Follow

**From books.ts routes:**
```typescript
router.get('/', validateQuery(bookQuerySchema), (req, res) => {
  const { page = 1, limit = 20, search, collection_id } = req.query as any;
  // ... filter logic
});
```

**From collections.ts routes:**
```typescript
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(collectionSchema), (req, res) => {
  // ... update logic
});
```

### Validation Schema Addition

**In schemas.ts:**
```typescript
// Reading status schema
export const readingStatusSchema = z.object({
  status: z.enum(['want_to_read', 'reading', 'read']),
});

// Update bookQuerySchema
export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.coerce.number().int().positive().optional(),
  collection_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['want_to_read', 'reading', 'read']).optional(), // NEW
});
```

---

## 3. Frontend Components to Modify

### 3.1 Library.vue (Main Changes)

**Current filter structure:**
```vue
<div class="library-header">
  <div class="search-box">...</div>
  <div class="filter-box">
    <select v-model="selectedCategory">...</select>
  </div>
  <div class="filter-box">
    <select v-model="selectedCollection">...</select>
  </div>
</div>
```

**Add reading status filter:**
```vue
<div class="filter-box">
  <select v-model="selectedStatus" @change="handleStatusChange">
    <option value="">全部状态</option>
    <option value="want_to_read">📖 想读</option>
    <option value="reading">📚 在读</option>
    <option value="read">✅ 已读</option>
  </select>
</div>
```

**Script additions:**
```typescript
const selectedStatus = ref<string | null>(null);

async function handleStatusChange() {
  // Call API with status filter
  const booksData = await getBooks(undefined, undefined, selectedStatus.value);
  books.value = booksData;
}
```

### 3.2 Reader.vue (Auto Status Update)

**Current onMounted:**
```typescript
onMounted(async () => {
  book.value = await getBook(bookId.value);
  await loadHighlights();
  await loadBookmarks();
  await loadNotes();
});
```

**Add auto-status logic:**
```typescript
onMounted(async () => {
  book.value = await getBook(bookId.value);
  
  // Auto-update reading status (STAT-03)
  if (book.value?.reading_status === 'want_to_read') {
    await updateReadingStatus(bookId.value, 'reading');
    book.value.reading_status = 'reading';
  }
  
  await loadHighlights();
  await loadBookmarks();
  await loadNotes();
});
```

### 3.3 BookCard.vue (Status Display)

**Add status indicator:**
```vue
<div class="card-content">
  <h3 class="card-title">{{ book.title }}</h3>
  <p class="card-author">{{ book.author || '未知作者' }}</p>
  <div class="card-meta">
    <span class="file-type-tag">{{ book.file_type.toUpperCase() }}</span>
    <span v-if="book.category" class="category-tag">{{ book.category }}</span>
    <!-- NEW: Status indicator -->
    <span v-if="book.reading_status" class="status-tag" :class="book.reading_status">
      {{ statusLabel(book.reading_status) }}
    </span>
  </div>
  <!-- ... progress ... -->
</div>
```

### 3.4 books.ts API Client

**Add new functions:**
```typescript
export interface Book {
  id: number;
  title: string;
  author: string | null;
  file_path: string;
  file_type: string;
  cover_path: string | null;
  category: string | null;
  tags: string | null;
  reading_status: string; // NEW
  created_at: string;
}

// Update getBooks to accept status filter
export async function getBooks(
  search?: string,
  collectionId?: number,
  status?: string // NEW
): Promise<Book[]> {
  const params: any = {};
  if (search) params.search = search;
  if (collectionId) params.collection_id = collectionId;
  if (status) params.status = status;
  const response = await api.get('/books', { params });
  return response.data.data || response.data;
}

// New function for status update
export async function updateReadingStatus(
  id: number,
  status: 'want_to_read' | 'reading' | 'read'
): Promise<Book> {
  const response = await api.put(`/books/${id}/status`, { status });
  return response.data;
}
```

---

## 4. Code Patterns to Follow

### 4.1 Database Operations
- Use `db()` getter after initialization
- Call `database.save()` after mutations
- Use parameterized queries for safety

### 4.2 API Route Structure
```typescript
// Pattern from collections.ts
router.put('/:id', 
  authMiddleware,           // Auth if needed
  validateParams(idParamSchema),  // Param validation
  validateBody(schema),     // Body validation
  (req, res) => {           // Handler
    try {
      // Logic
      database.save();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: '...' });
    }
  }
);
```

### 4.3 Error Handling
- 404 for not found
- 400 for validation errors
- 500 for server errors
- Chinese error messages (consistent with collections.ts)

### 4.4 Frontend State Management
- Use `ref()` for reactive state
- Use `computed()` for derived state
- Call API in `onMounted()` or event handlers
- Handle errors with try/catch and console.error

---

## 5. Validation Considerations

### Backend Validation (Zod)
```typescript
export const readingStatusSchema = z.object({
  status: z.enum(['want_to_read', 'reading', 'read'], {
    errorMap: () => ({ message: '阅读状态无效' })
  }),
});
```

### Frontend Validation
- TypeScript enum type for status
- UI only shows valid options (select dropdown)
- No free-form input

### Edge Cases
1. **Invalid status value in DB:** Default to 'want_to_read' on read
2. **Concurrent updates:** Last write wins (acceptable for this use case)
3. **Status already set:** Idempotent update (no error)

---

## 6. Edge Cases to Handle

### STAT-01: Three Reading States
- ✅ Default value: 'want_to_read'
- ✅ Valid values enforced by Zod enum
- ✅ Database stores as TEXT

### STAT-02: Manual Status Toggle
- ✅ UI: Dropdown or button group in BookDetail view
- ✅ API: PUT /api/books/:id/status
- ⚠️ Consider: Should status change be allowed for completed books?
  - **Decision:** Yes, user may want to re-read

### STAT-03: Auto Status on Open
- ✅ Check current status in Reader.vue onMounted
- ✅ Only update if status === 'want_to_read'
- ⚠️ Edge case: What if user opens book briefly and closes?
  - **Decision:** Still mark as 'reading' (acceptable behavior)
- ⚠️ Edge case: What if API call fails?
  - **Decision:** Silent failure, don't block reading

### STAT-04: Filter by Status
- ✅ Add to existing filter bar in Library.vue
- ✅ Server-side filtering for consistency with collection filter
- ⚠️ Edge case: Status filter + Collection filter combined
  - **Decision:** Support both (AND logic)

---

## 7. Implementation Checklist

### Backend (backend/src)
- [ ] `models/book.ts`: Add reading_status column migration
- [ ] `validators/schemas.ts`: Add readingStatusSchema, update bookQuerySchema
- [ ] `routes/books.ts`: 
  - Add PUT /:id/status endpoint
  - Add status filter to GET / endpoint

### Frontend (frontend/src)
- [ ] `api/books.ts`: 
  - Add reading_status to Book interface
  - Add updateReadingStatus function
  - Update getBooks to accept status param
- [ ] `views/Library.vue`: Add status filter dropdown
- [ ] `views/Reader.vue`: Add auto-status update in onMounted
- [ ] `components/BookCard.vue`: Add status indicator (optional)

---

## 8. Questions for Clarification

1. **Auth requirement:** Should PUT /books/:id/status require auth?
   - Collections require auth for modifications
   - Reading status is user preference, not admin action
   - **Recommendation:** No auth required

2. **Status completion:** Should reaching 100% progress auto-mark as 'read'?
   - Not in current requirements
   - Could be future enhancement
   - **Recommendation:** Manual only for Phase 15

3. **UI placement:** Where to show status toggle?
   - BookCard hover menu?
   - BookDetail page?
   - Library filter bar only?
   - **Recommendation:** Library filter + BookDetail page

---

## 9. Dependencies

- No new external dependencies required
- Reuses existing: express, zod, axios, vue
- Database: SQLite (already in use)

---

## 10. Testing Strategy

### Backend Tests
1. PUT /books/:id/status with valid status → 200
2. PUT /books/:id/status with invalid status → 400
3. PUT /books/:id/status for non-existent book → 404
4. GET /books?status=reading → filtered results
5. GET /books?status=invalid → 400

### Frontend Tests
1. Library loads with status filter
2. Status filter changes book list
3. Opening 'want_to_read' book changes to 'reading'
4. Opening 'reading' book stays 'reading'
5. BookCard shows status indicator

---

*Research complete. Ready for planning.*
