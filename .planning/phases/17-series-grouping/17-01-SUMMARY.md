# Plan 17-01 Summary: Backend Series Grouping Infrastructure

**Status:** COMPLETED
**Date:** 2026-05-15
**Wave:** 1 (no dependencies)

## Tasks Completed

### Task 1: Add series table and columns to database schema
- Created `series` table with id, name, description, created_at
- Added `series_id` column to books (INTEGER FK with ON DELETE SET NULL)
- Added `series_index` column to books (REAL for flexible reordering)
- Added index `idx_books_series` on books(series_id)

**Commit:** 45829fd

### Task 2: Add series validation schemas
- Added `seriesSchema` with name (1-100 chars) and description (max 500 chars)
- Added `setBookSeriesSchema` for seriesId (nullable int) and seriesIndex (optional number)
- Added `series_id` filter to `bookQuerySchema`
- Exported `SeriesInput` and `SetBookSeriesInput` types

**Commit:** 2629a70

### Task 3: Create series route with full CRUD API
Implemented all endpoints in `backend/src/routes/series.ts`:
- `GET /` - List all series with book counts
- `GET /:id` - Get series with ordered books
- `POST /` - Create series (auth required, 409 for duplicates)
- `PUT /:id` - Update series (auth required)
- `DELETE /:id` - Delete series (auth required, ON DELETE SET NULL)
- `PUT /:id/books/:bookId` - Add book to series
- `DELETE /:id/books/:bookId` - Remove book from series
- `POST /reorder` - Reorder books within series
- `POST /detect` - Auto-detect series info from titles

**Commit:** 93a3f1b

### Task 4: Create auto-detection utility
Implemented `backend/src/utils/seriesDetection.ts`:
- `detectSeriesInfo(title)` - Extracts series name and index from title
- Supports Chinese patterns (第N卷, 第N部, 第N册)
- Supports English patterns (Vol.N, Volume N)
- Supports parentheses patterns ((N), （N）)
- Supports hash prefix patterns (#N, ＃N)
- Exclusion patterns for years and dates
- Sanity checks on seriesName length (2-100) and index (1-999)

**Commit:** 93a3f1b

### Task 5: Add series filter to books route
Modified `GET /api/books`:
- Added `series_id` query parameter
- Filter condition: `b.series_id = ?`
- Order by `series_index ASC` when filtering by series
- Updated count query to include series filter

**Commit:** 3a6e473

### Task 6: Add PUT /:id/series endpoint to books route
Implemented `PUT /api/books/:id/series`:
- Validates with `setBookSeriesSchema`
- If `seriesId` is null, removes book from series
- If `seriesId` is provided, verifies series exists
- Auto-calculates series_index if not provided
- Returns updated book

**Commit:** 3a6e473

### Task 7: Register series router
- Imported `seriesRouter` in `index.ts`
- Registered at `/api/series` endpoint

**Commit:** eda7442

## Files Modified

| File | Changes |
|------|---------|
| `backend/src/models/book.ts` | +23 lines (series table, columns, index) |
| `backend/src/validators/schemas.ts` | +15 lines (validation schemas) |
| `backend/src/routes/series.ts` | +237 lines (new file) |
| `backend/src/utils/seriesDetection.ts` | +78 lines (new file) |
| `backend/src/routes/books.ts` | +73 lines (series filter, assignment) |
| `backend/src/index.ts` | +2 lines (router registration) |

## Requirements Covered

| ID | Description | Status |
|----|-------------|--------|
| SERI-01 | Create, delete, rename series | COMPLETE |
| SERI-02 | Assign book to series with order | COMPLETE |
| SERI-03 | Filter books by series | COMPLETE |
| SERI-04 | Auto-detect series info | COMPLETE |

## API Endpoints Added

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/series` | List all series with book counts | No |
| GET | `/api/series/:id` | Get series with ordered books | No |
| POST | `/api/series` | Create series | Yes |
| PUT | `/api/series/:id` | Update series | Yes |
| DELETE | `/api/series/:id` | Delete series | Yes |
| PUT | `/api/series/:id/books/:bookId` | Add book to series | Yes |
| DELETE | `/api/series/:id/books/:bookId` | Remove book from series | Yes |
| POST | `/api/series/reorder` | Reorder books in series | Yes |
| POST | `/api/series/detect` | Auto-detect series info | Yes |
| PUT | `/api/books/:id/series` | Set book series | No |

## Technical Decisions

1. **REAL for series_index**: Allows fractional values (e.g., 1.5) for O(1) reordering instead of O(n) with INTEGER
2. **ON DELETE SET NULL**: Books remain in database when series is deleted
3. **UNIQUE constraint on series.name**: Prevents duplicates with 409 status
4. **Auto-index calculation**: New books get MAX(series_index) + 1
5. **Chinese error messages**: Consistent with existing codebase

## Verification

- TypeScript compilation: PASSED
- All endpoints follow existing patterns from collections.ts
- Validation uses Zod schemas consistently
- database.save() called after all write operations
