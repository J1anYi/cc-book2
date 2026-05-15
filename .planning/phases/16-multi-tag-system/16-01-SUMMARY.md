---
phase: 16-multi-tag-system
plan: 01
subsystem: backend
tags:
  - database
  - api
  - migration
  - validation
requires:
  - database connection
provides:
  - tags table
  - book_tags junction table
  - tag CRUD API
  - book-to-tag assignment API
  - tag filtering with AND/OR modes
affects:
  - books route
  - database schema
tech-stack:
  added:
    - sql.js
    - zod validation
  patterns:
    - many-to-many junction table
    - CASCADE DELETE
    - subquery filtering
key-files:
  created:
    - backend/src/routes/tags.ts
  modified:
    - backend/src/models/book.ts
    - backend/src/validators/schemas.ts
    - backend/src/routes/books.ts
    - backend/src/index.ts
decisions:
  - Use metadata table for migration tracking instead of checking tags count
  - Support multiple tag separators (comma, semicolon, Chinese variants)
  - OR mode as default for tag filtering (more permissive)
metrics:
  duration: 15 minutes
  completed_date: 2026-05-15
---

# Phase 16 Plan 01: Backend Multi-Tag Infrastructure Summary

Implemented backend infrastructure for multi-tag system: database schema with migration, validation schemas, and full REST API for tag CRUD and book-to-tag assignment with AND/OR filtering support.

## Completed Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Add tags and book_tags tables to database schema | 79950fc | backend/src/models/book.ts |
| 2 | Implement data migration from books.tags TEXT field | ee04abb | backend/src/models/book.ts |
| 3 | Add tag validation schemas | 8d31e28 | backend/src/validators/schemas.ts |
| 4 | Create tags route with CRUD endpoints | 1eb9cdc | backend/src/routes/tags.ts (new) |
| 5 | Update books route for tag filtering | 32fac18 | backend/src/routes/books.ts |
| 6 | Register tags router in index.ts | aab2ecd | backend/src/index.ts |

## Implementation Details

### Database Schema

Added three new tables:
- **tags**: `id`, `name` (UNIQUE), `color` (optional hex), `created_at`
- **book_tags**: Junction table with composite PK `(book_id, tag_id)` and CASCADE DELETE
- **metadata**: Key-value store for migration tracking

Indexes created:
- `idx_book_tags_book` on `book_tags(book_id)`
- `idx_book_tags_tag` on `book_tags(tag_id)`

### Data Migration

One-time migration converts existing comma-separated tags:
- Checks `metadata` table for `tags_migration_complete` flag
- Parses `books.tags` field using regex `/[,;，；]/` (supports Chinese separators)
- Creates tags in `tags` table if they don't exist
- Creates `book_tags` entries for each book-tag relationship
- Sets migration flag after completion

### Validation Schemas

Added to `validators/schemas.ts`:
- `tagSchema`: name (1-50 chars, required), color (hex regex, optional)
- `setBookTagsSchema`: tagIds array of positive integers
- Extended `bookQuerySchema` with `tags` (string) and `tagMode` (AND/OR enum, default: OR)

### API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | /api/tags | List all tags with usage_count |
| POST | /api/tags | Create new tag (auth required) |
| PUT | /api/tags/:id | Update tag (auth required) |
| DELETE | /api/tags/:id | Delete tag with CASCADE (auth required) |
| GET | /api/tags/book/:bookId | Get tags for specific book |
| POST | /api/tags/books/:bookId | Set tags for book (replace all, auth required) |

### Tag Filtering

Books API now supports tag filtering:
- `?tags=1,2,3` - Filter by tag IDs (comma-separated)
- `?tagMode=OR` - Books with ANY of the tags (default)
- `?tagMode=AND` - Books with ALL of the tags

AND mode uses subquery with `HAVING COUNT(DISTINCT bt.tag_id) = ?` for exact match.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

TypeScript compilation passes with no errors:
```bash
cd backend && npx tsc --noEmit
# (no output = success)
```

## Files Modified

```
backend/src/models/book.ts        - Added tables, indexes, migration logic
backend/src/validators/schemas.ts - Added tag validation schemas
backend/src/routes/tags.ts        - New file: Tag CRUD API
backend/src/routes/books.ts       - Added tag filtering support
backend/src/index.ts              - Registered tags router
```
