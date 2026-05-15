---
phase: 15-reading-status
plan: 01
subsystem: backend
tags: [database, api, validation, reading-status]
dependency_graph:
  requires: []
  provides: [reading_status column, PUT /:id/status, GET /?status=X]
  affects: [Library.vue, Reader.vue, BookCard.vue]
tech_stack:
  added: []
  patterns: [Zod validation, SQLite migration, REST API]
key_files:
  created: []
  modified:
    - backend/src/models/book.ts
    - backend/src/validators/schemas.ts
    - backend/src/routes/books.ts
decisions:
  - No CHECK constraint at DB level (SQLite limitation, validation in Zod)
  - No auth required for PUT /:id/status (user preference, not admin action)
  - Status filter uses server-side filtering for consistency
metrics:
  duration: ~5 minutes
  completed_date: 2026-05-15
  commits: 3
  files_changed: 3
  lines_added: 58
  lines_removed: 11
---

# Phase 15 Plan 01: Backend Reading Status Support Summary

## One-liner

Implemented backend support for three-state reading status tracking (want_to_read, reading, read) with database column migration, Zod validation schemas, and REST API endpoints for status update and filtering.

## What Was Done

### Task 1: Add reading_status column to books table

Added database migration to add `reading_status` column with default value 'want_to_read':
- PRAGMA table_info check to detect existing column
- ALTER TABLE migration for new column
- Default value ensures all existing books start as 'want_to_read'

**File:** `backend/src/models/book.ts`

### Task 2: Add reading status validation schemas

Added Zod validation schemas for reading status:
- `readingStatusSchema` - validates status update requests with Chinese error message
- Updated `bookQuerySchema` - added optional `status` filter parameter

**File:** `backend/src/validators/schemas.ts`

### Task 3: Add PUT /:id/status endpoint and status filter

Added API endpoints for reading status management:
- `PUT /api/books/:id/status` - updates book reading status (no auth required)
- `GET /api/books?status=X` - filters books by reading status
- Both main query and count query support status filter

**File:** `backend/src/routes/books.ts`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- TypeScript compilation: PASSED (all files)
- Database migration: Column added with PRAGMA check pattern
- API endpoints: Follow existing route patterns with Chinese error messages

## Commits

| Commit | Message |
|--------|---------|
| e34c3d1 | feat(15-01): add reading_status column to books table |
| 7d45807 | feat(15-01): add reading status validation schemas |
| e88c2cf | feat(15-01): add PUT /:id/status endpoint and status filter |

## Key Decisions

1. **No CHECK constraint at database level** - SQLite doesn't support ADD COLUMN with CHECK. Validation enforced in Zod schema instead.

2. **No auth for PUT /:id/status** - Reading status is user preference, not admin action. Consistent with read operations.

3. **Server-side filtering** - Status filter uses same pattern as collection_id filter for consistency and scalability.

## Threat Model Compliance

| Threat | Mitigation | Status |
|--------|------------|--------|
| T-15-01: Tampering on PUT /:id/status | Zod enum validation | Implemented |
| T-15-02: Tampering on GET /?status=X | Zod enum validation | Implemented |
| T-15-03: Info disclosure | Accepted (no PII) | N/A |

## Next Steps

Phase 15-02 will implement frontend integration:
- Add status filter dropdown in Library.vue
- Add auto-status update in Reader.vue
- Add status indicator in BookCard.vue

---

*Completed: 2026-05-15*
