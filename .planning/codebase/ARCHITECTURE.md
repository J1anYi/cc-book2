# Architecture Analysis

## Overall Architecture Style

**Monolithic Application with Frontend-Backend Separation**

This is a classic two-tier monolithic architecture:
- **Frontend**: Single Page Application (SPA) built with Vue 3
- **Backend**: RESTful API server built with Express.js
- **Database**: Embedded SQLite (better-sqlite3) for persistence
- **Communication**: HTTP/REST API with JSON payloads

The architecture follows a **client-server model** with clear separation of concerns between presentation (Vue) and business logic/data access (Express).

---

## Frontend Architecture

### Component Structure

The frontend follows a **feature-based component organization**:

```
src/
├── App.vue              # Root component (layout shell)
├── main.ts              # Application entry point
├── router/              # Vue Router configuration
├── api/                 # API client modules
├── views/               # Page-level components
└── components/          # Reusable UI components
```

**Component Hierarchy:**
```
App.vue (Root)
├── Upload.vue (Page: Book upload & listing)
├── Admin.vue (Page: Admin management panel)
└── Reader.vue (Page: Book reading interface)
    ├── EpubReader.vue (EPUB rendering)
    ├── PdfReader.vue (PDF rendering)
    └── TxtReader.vue (Text file rendering)
```

### State Management

**No centralized state management library** (Vuex/Pinia). State is managed using:

1. **Component-level state**: Vue 3 Composition API with `ref()` and `reactive()`
2. **URL state**: Route parameters for book ID (`/read/:id`)
3. **Browser storage**: `localStorage` for authentication token persistence
4. **API caching**: Components fetch data on mount, no global cache

**State Flow Pattern:**
```
User Action → Component Method → API Call → Local State Update → UI Re-render
```

### Data Flow Patterns

**Unidirectional data flow within components:**

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue Component                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Template  │ ←──│   Script    │ ←──│    API      │     │
│  │   (Render)  │    │  (Logic)    │    │  (Fetch)    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         ↑                  │                                 │
│         └──────────────────┘                                 │
│              (Reactive)                                      │
└─────────────────────────────────────────────────────────────┘
```

**Parent-Child Communication:**
- **Props down**: Parent passes data to children (e.g., `bookId`, `fileUrl`)
- **Events up**: Children emit events to parents (e.g., `@progress`)

---

## Backend Architecture

### Layered Architecture

The backend follows a simplified **MVC-inspired layered architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│         Routes (HTTP handlers, request validation)           │
│    books.ts, admin.ts, categories.ts, reading.ts, files.ts  │
├─────────────────────────────────────────────────────────────┤
│                    Middleware Layer                          │
│         auth.ts (authentication), errorHandler.ts            │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                      │
│              utils/metadata.ts (file processing)             │
├─────────────────────────────────────────────────────────────┤
│                      Data Access Layer                       │
│              models/book.ts (SQLite database)                │
└─────────────────────────────────────────────────────────────┘
```

### Route Organization

Routes are organized by **resource/domain**:

| Route Module | Path Prefix | Responsibility |
|-------------|-------------|----------------|
| `books.ts` | `/api/books` | Book CRUD, file upload |
| `admin.ts` | `/api/admin` | Authentication |
| `categories.ts` | `/api/categories` | Category management |
| `reading.ts` | `/api/reading` | Progress, bookmarks, notes |
| `files.ts` | `/api/files` | Static file serving with Range support |

### Database Pattern

**Active Record-like pattern** with direct SQL:

- Single database connection (better-sqlite3)
- Synchronous API (no async/await for DB operations)
- Prepared statements for SQL injection prevention
- Schema defined in code (`db.exec()` with CREATE TABLE)

---

## API Design Patterns

### RESTful API Design

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/books` | List all books |
| GET | `/api/books/:id` | Get single book |
| POST | `/api/books` | Upload new book |
| PATCH | `/api/books/:id` | Update book metadata |
| DELETE | `/api/books/:id` | Delete book |
| GET | `/api/reading/progress/:bookId` | Get reading progress |
| POST | `/api/reading/progress` | Save reading progress |
| GET | `/api/files/:id` | Stream book file |

### Response Patterns

**Success Response:**
```json
{
  "id": 1,
  "title": "Book Title",
  "author": "Author Name"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

### Authentication Pattern

**Simple token-based authentication:**
1. POST `/api/admin/login` with password
2. Server returns Base64-encoded session token
3. Client stores token in `localStorage`
4. Subsequent requests include `Authorization: Bearer <token>`
5. Server validates token via `authMiddleware`

---

## Key Architectural Decisions

### 1. SQLite over PostgreSQL/MySQL
- **Rationale**: Simple deployment, no external DB server required
- **Trade-off**: Not suitable for concurrent writes or large scale

### 2. File Storage in Filesystem
- **Rationale**: Efficient for large binary files (EPUB/PDF)
- **Implementation**: Files stored in `data/` directory, paths in DB

### 3. Range Request Support
- **Rationale**: Enable PDF.js streaming without loading entire file
- **Implementation**: `files.ts` handles `Range` header for partial content

### 4. Client-Side Rendering for Books
- **Rationale**: Leverage mature libraries (epubjs, pdfjs-dist)
- **Trade-off**: Heavier initial bundle, better reading experience

### 5. No Build Step for Backend
- **Rationale**: Use `tsx` for TypeScript execution in development
- **Production**: TypeScript compiled to JavaScript via `tsc`

### 6. Vite Proxy for Development
- **Rationale**: Avoid CORS issues during development
- **Implementation**: `/api/*` proxied to `localhost:3000`

### 7. Session Management in Memory
- **Rationale**: Simple implementation for single-server deployment
- **Trade-off**: Sessions lost on server restart, not scalable

---

## Security Considerations

1. **File Upload Validation**: Only `.epub`, `.pdf`, `.txt` allowed
2. **File Size Limit**: 50MB maximum
3. **Auth Middleware**: Protects admin routes
4. **SQL Injection**: Prevented via prepared statements
5. **CORS**: Enabled via `cors` middleware

---

## Scalability Limitations

1. **Single-threaded**: Node.js event loop
2. **In-memory sessions**: Not distributed
3. **SQLite**: Limited concurrent write capacity
4. **No caching**: Every request hits database
5. **No CDN**: Static files served by backend
