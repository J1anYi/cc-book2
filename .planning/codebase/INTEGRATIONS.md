# External Integrations

## Overview

This document describes all external services, APIs, and third-party libraries integrated into the book library system.

---

## Document Rendering Libraries

### EPUB.js (v0.3.93)

**Purpose**: EPUB book parsing and rendering

**Integration Point**: frontend/src/components/EpubReader.vue

**Features Used**:
- Parse EPUB files from URL
- Render content to DOM container
- Navigation (next/previous page)
- Location tracking for progress
- Theme/styling customization

---

### PDF.js (v5.7.284)

**Purpose**: PDF parsing and canvas rendering

**Integration Point**: frontend/src/components/PdfReader.vue

**CDN Dependency**: 
- PDF.js worker loaded from cdnjs.cloudflare.com (v3.11.174)

**Features Used**:
- Parse PDF documents from URL
- Render pages to HTML canvas
- Page navigation and jumping
- Zoom/scale control

---

## HTTP Communication

### Axios (v1.6.7)

**Purpose**: HTTP client for backend API communication

**Integration Points**: 
- frontend/src/api/books.ts
- frontend/src/api/reading.ts

**API Endpoints Used**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/books | Upload book file |
| GET | /api/books | List books (with search) |
| GET | /api/books/:id | Get single book |
| DELETE | /api/books/:id | Delete book |
| PATCH | /api/books/:id | Update book metadata |
| GET | /api/files/:id | Download book file |
| GET | /api/reading/progress/:id | Get reading progress |
| POST | /api/reading/progress | Save reading progress |
| GET | /api/reading/history | Get reading history |
| GET | /api/reading/bookmarks/:id | Get bookmarks |
| POST | /api/reading/bookmarks | Add bookmark |
| DELETE | /api/reading/bookmarks/:id | Delete bookmark |
| GET | /api/reading/notes/:id | Get notes |
| POST | /api/reading/notes | Add note |
| PUT | /api/reading/notes/:id | Update note |
| DELETE | /api/reading/notes/:id | Delete note |
| POST | /api/admin/login | Admin login |
| POST | /api/admin/logout | Admin logout |
| GET | /api/categories | List categories |
| POST | /api/categories | Create category |
| PUT | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |

---

## File Storage

### Local File System

**Purpose**: Persistent storage for uploaded book files

**Configuration**:
- Storage path: data/ directory (project root)
- Filename: UUID + original extension
- Max size: 50 MB per file

**Integration Point**: backend/src/routes/books.ts

### File Serving with Range Support

**Purpose**: Stream book files with partial content support for large files

**Integration Point**: backend/src/routes/files.ts

**Features**:
- HTTP 206 Partial Content responses
- Byte-range requests for efficient streaming
- Content-Type based on file type

---

## Authentication

### Custom Token-Based Authentication

**Purpose**: Admin panel access control

**Implementation**: backend/src/middleware/auth.ts

**Configuration**:
- ADMIN_PASSWORD env var (default: admin123)
- SESSION_TOKEN env var (default: secret-token-123)
- SESSION_EXPIRY: 24 hours

**Protected Routes**:
- Book deletion
- Book metadata updates
- Category management
- Admin panel access

---

## Database

### SQLite via better-sqlite3

**Purpose**: Persistent data storage

**Database File**: data/books.db

**Integration Point**: backend/src/models/book.ts

**Tables**:
- books - Book metadata and file references
- categories - Category definitions
- reading_progress - Per-book reading position
- bookmarks - User bookmarks
- notes - User annotations

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| ADMIN_PASSWORD | admin123 | Admin login password |
| SESSION_TOKEN | secret-token-123 | Token generation secret |

---

## External CDN Dependencies

| Resource | URL | Purpose |
|----------|-----|---------|
| PDF.js Worker | cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js | PDF rendering worker |

---

## No External Services

This application is designed to run entirely locally without dependencies on:
- No cloud storage services
- No external authentication providers (OAuth, etc.)
- No third-party analytics
- No payment integrations
- No email/notification services

All data is stored locally in the data/ directory.
