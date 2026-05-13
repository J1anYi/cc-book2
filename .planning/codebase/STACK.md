# Technology Stack Analysis

## Project Overview

**书籍观看系统 (Book Library System)** - A personal book library system for reading EPUB, PDF, and TXT format books with progress tracking, bookmarks, and notes.

---

## Runtime Environments

| Component | Runtime | Version |
|-----------|---------|---------|
| Frontend | Node.js | ES2020 target |
| Backend | Node.js | ES2022 target |
| TypeScript | Both | 5.3.3 |

---

## Frontend Stack

### Framework
- **Vue 3** (v3.4.21) - Composition API with `<script setup>` syntax
- **Vue Router** (v4.6.4) - Client-side routing with history mode

### Build Tools
- **Vite** (v5.1.4) - Development server and build tool
- **vue-tsc** (v2.0.6) - Vue TypeScript type checking
- **@vitejs/plugin-vue** (v5.0.4) - Vite plugin for Vue SFC support

### Development Server
- Port: 5173
- API Proxy: /api -> http://localhost:3000

---

## Backend Stack

### Framework
- **Express** (v4.18.2) - Web server framework

### Build Tools
- **TypeScript** (v5.3.3) - Type-safe development
- **tsx** (v4.7.1) - TypeScript execution for development (watch mode)

### Server Configuration
- Port: 3000
- CORS enabled
- JSON body parsing

---

## Database

### Technology
- **SQLite** via **better-sqlite3** (v9.4.3)
- Synchronous API for better performance
- File-based storage: data/books.db

### Schema Tables
| Table | Purpose |
|-------|---------|
| books | Book metadata (title, author, file path, type, category, tags) |
| categories | Book categories |
| reading_progress | Reading position and percentage per book |
| bookmarks | User bookmarks with page/chapter/position |
| notes | User notes with content and color |

---

## Core Libraries

### Frontend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| axios | 1.6.7 | HTTP client for API requests |
| epubjs | 0.3.93 | EPUB parsing and rendering |
| pdfjs-dist | 5.7.284 | PDF parsing and canvas rendering |

### Backend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| express | 4.18.2 | Web server framework |
| cors | 2.8.5 | Cross-origin resource sharing |
| multer | 1.4.5-lts.1 | File upload handling |
| better-sqlite3 | 9.4.3 | SQLite database driver |
| uuid | 9.0.0 | Unique ID generation for uploaded files |

---

## File Upload Configuration

- **Max file size**: 50 MB
- **Allowed formats**: .epub, .pdf, .txt
- **Storage**: data/ directory with UUID filenames
