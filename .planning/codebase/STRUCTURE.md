# Codebase Structure

**Analysis Date:** 2026-05-13

## Directory Layout

```
cc-book2/
├── .claude/              # Claude AI configuration
├── .git/                 # Git repository
├── .planning/            # Planning and documentation
│   └── codebase/         # Architecture documentation
├── backend/              # Express.js backend server
│   ├── src/              # TypeScript source code
│   │   ├── index.ts      # Application entry point
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API route handlers
│   │   └── utils/        # Utility functions
│   ├── dist/             # Compiled JavaScript (production)
│   ├── package.json      # Backend dependencies
│   └── tsconfig.json     # TypeScript configuration
├── frontend/             # Vue 3 frontend application
│   ├── src/              # Vue source code
│   │   ├── api/          # API client functions
│   │   ├── components/   # Reusable Vue components
│   │   ├── views/        # Page-level components
│   │   ├── router/       # Vue Router configuration
│   │   ├── App.vue       # Root component
│   │   └── main.ts       # Application entry point
│   ├── dist/             # Production build output
│   ├── index.html        # HTML entry point
│   ├── package.json      # Frontend dependencies
│   ├── tsconfig.json     # TypeScript configuration
│   └── vite.config.ts    # Vite build configuration
├── data/                 # Data storage directory
│   ├── books.db          # SQLite database (auto-created)
│   └── *.epub/pdf/txt    # Uploaded book files
└── README.md             # Project documentation
```

## Directory Purposes

**backend/ - Express.js API server**
- Contains: TypeScript source, compiled output, package config
- Key files: `src/index.ts`, `src/models/book.ts`, `src/routes/*.ts`

**backend/src/middleware/ - Express middleware functions**
- Contains: Authentication and error handling
- Key files: `auth.ts`, `errorHandler.ts`

**backend/src/models/ - Database schema and connection**
- Contains: SQLite table definitions, DB export
- Key files: `book.ts`

**backend/src/routes/ - API endpoint handlers**
- Contains: One file per resource domain
- Key files: `books.ts`, `reading.ts`, `files.ts`, `admin.ts`, `categories.ts`

**backend/src/utils/ - Shared utility functions**
- Contains: File metadata extraction
- Key files: `metadata.ts`

**frontend/src/api/ - API client modules for backend communication**
- Contains: Axios-based API functions and TypeScript interfaces
- Key files: `books.ts`, `reading.ts`

**frontend/src/components/ - Reusable Vue components (reader engines)**
- Contains: Format-specific reader components
- Key files: `EpubReader.vue`, `PdfReader.vue`, `TxtReader.vue`

**frontend/src/views/ - Page-level components mapped to routes**
- Contains: Full-page views with their own logic
- Key files: `Upload.vue`, `Admin.vue`, `Reader.vue`

**frontend/src/router/ - Vue Router configuration**
- Contains: Route definitions and navigation guards
- Key files: `index.ts`

**data/ - Persistent data storage (database + uploaded files)**
- Contains: SQLite DB file, uploaded book files
- Generated: Yes (database auto-created, files user-uploaded)
- Committed: Partially (sample TXT files are committed; DB and uploads are not)

## Key File Locations

**Entry Points:**
- `backend/src/index.ts`: Express server initialization, route mounting, port binding
- `frontend/src/main.ts`: Vue app creation, router registration, DOM mounting
- `frontend/index.html`: HTML shell for SPA

**Configuration:**
- `backend/package.json`: Backend dependencies and scripts
- `backend/tsconfig.json`: TypeScript config (ES2022 target, ESNext modules, strict)
- `frontend/package.json`: Frontend dependencies and scripts
- `frontend/tsconfig.json`: TypeScript config for Vue
- `frontend/vite.config.ts`: Vite build config with API proxy

**Core Logic:**
- `backend/src/models/book.ts`: Database schema, table creation, DB connection export
- `backend/src/routes/books.ts`: Book CRUD + Multer file upload
- `backend/src/routes/reading.ts`: Reading progress, bookmarks, notes CRUD
- `backend/src/routes/files.ts`: File streaming with HTTP Range support
- `backend/src/middleware/auth.ts`: Token generation, validation, auth middleware
- `frontend/src/api/books.ts`: Axios client for book/auth/category APIs
- `frontend/src/api/reading.ts`: Axios client for reading progress APIs
- `frontend/src/views/Reader.vue`: Book reader page with format detection

**Testing:**
- Not currently present in the codebase

## Naming Conventions

**Files:**
- Backend routes: `camelCase.ts` matching resource name (e.g., `books.ts`, `reading.ts`)
- Backend middleware: `camelCase.ts` (e.g., `auth.ts`, `errorHandler.ts`)
- Frontend views: `PascalCase.vue` (e.g., `Upload.vue`, `Reader.vue`)
- Frontend components: `PascalCase.vue` (e.g., `EpubReader.vue`, `PdfReader.vue`)
- Frontend API modules: `camelCase.ts` matching backend resource (e.g., `books.ts`, `reading.ts`)
- Frontend router: `index.ts` (directory-based naming)

**Directories:**
- Backend: `camelCase` (e.g., `middleware/`, `models/`, `routes/`, `utils/`)
- Frontend: `camelCase` (e.g., `api/`, `components/`, `views/`, `router/`)

## Where to Add New Code

**New API Endpoint:**
- Route handler: `backend/src/routes/<resource>.ts`
- Register in: `backend/src/index.ts` (import and add `app.use()`)
- Database table: `backend/src/models/book.ts` (add `db.exec()` CREATE TABLE)
- Frontend API client: `frontend/src/api/<resource>.ts`

**New Page/View:**
- Component: `frontend/src/views/<Name>.vue`
- Route: Add entry in `frontend/src/router/index.ts`

**New Reader Component (new file format):**
- Component: `frontend/src/components/<Format>Reader.vue`
- Integration: Import in `frontend/src/views/Reader.vue` and add conditional rendering
- Props: Must accept `bookId: number` and `fileUrl: string`
- Events: Must emit `progress` event with `{ page: number; percent: number }`

**New Middleware:**
- Implementation: `backend/src/middleware/<name>.ts`
- Registration: Apply in specific routes or globally in `backend/src/index.ts`

**New Database Table:**
- Schema definition: `backend/src/models/book.ts` (add `db.exec()` block)
- Access: Import `db` from `../models/book.js` in route files

**Shared Utility:**
- Backend: `backend/src/utils/<name>.ts`
- Frontend: Create `frontend/src/utils/<name>.ts` (directory does not yet exist)

## Special Directories

**data/ - SQLite database and uploaded book files**
- Generated: Yes (runtime)
- Committed: Partially (sample data committed, runtime files gitignored)
- Note: File paths stored in DB reference this directory

**frontend/dist/ - Production build output**
- Generated: Yes (`npm run build`)
- Committed: No (should be gitignored)

**backend/dist/ - Compiled TypeScript output**
- Generated: Yes (`npm run build` / `tsc`)
- Committed: No (should be gitignored)

**frontend/node_modules/ - Frontend npm dependencies**
- Generated: Yes (`npm install`)
- Committed: No

## Module Dependency Graph

### Backend

```
index.ts
├── routes/books.ts ──────┐
├── routes/admin.ts ──────┤
├── routes/categories.ts ─┤── models/book.ts (database)
├── routes/reading.ts ────┤
└── routes/files.ts ──────┘

routes/books.ts
└── utils/metadata.ts (file metadata extraction)
└── middleware/auth.ts (delete/update protection)

routes/admin.ts
└── middleware/auth.ts (login function)

routes/categories.ts
└── middleware/auth.ts (write protection)
```

### Frontend

```
main.ts
├── App.vue
└── router/index.ts
    ├── views/Upload.vue ──── api/books.ts
    ├── views/Admin.vue ───── api/books.ts
    └── views/Reader.vue
         ├── api/books.ts
         ├── api/reading.ts
         ├── components/EpubReader.vue ── api/reading.ts
         ├── components/PdfReader.vue ─── api/reading.ts
         └── components/TxtReader.vue ─── api/reading.ts
```

## Database Schema Reference

### books table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK AUTOINCREMENT | Unique identifier |
| title | TEXT | NOT NULL | Book title |
| author | TEXT | | Author name |
| file_path | TEXT | NOT NULL | Filesystem path to file |
| file_type | TEXT | NOT NULL | epub/pdf/txt |
| cover_path | TEXT | | Cover image path |
| category | TEXT | | Category name |
| tags | TEXT | | Comma-separated tags |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### categories table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL UNIQUE | Category name |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### reading_progress table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK AUTOINCREMENT | |
| book_id | INTEGER | NOT NULL FK -> books | |
| current_page | INTEGER | DEFAULT 0 | |
| current_chapter | TEXT | | EPUB chapter href |
| progress_percent | REAL | DEFAULT 0 | 0-100 |
| last_read_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### bookmarks table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK AUTOINCREMENT | |
| book_id | INTEGER | NOT NULL FK -> books | |
| page_number | INTEGER | | |
| chapter | TEXT | | |
| position | TEXT | | |
| note | TEXT | | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### notes table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK AUTOINCREMENT | |
| book_id | INTEGER | NOT NULL FK -> books | |
| page_number | INTEGER | | |
| chapter | TEXT | | |
| position | TEXT | | |
| content | TEXT | NOT NULL | Note text |
| color | TEXT | DEFAULT yellow | Highlight color |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

---

*Structure analysis: 2026-05-13*
