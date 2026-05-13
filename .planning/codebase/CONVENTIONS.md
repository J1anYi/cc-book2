# Code Conventions

This document outlines the coding conventions and patterns used in the cc-book2 project.

## Project Structure

```
cc-book2/
├── backend/           # Express + TypeScript backend
│   ├── src/
│   │   ├── middleware/   # Express middleware (auth, error handling)
│   │   ├── models/       # Database models and schema
│   │   ├── routes/       # API route handlers
│   │   ├── utils/        # Utility functions
│   │   └── index.ts      # Application entry point
│   └── package.json
├── frontend/          # Vue 3 + TypeScript frontend
│   ├── src/
│   │   ├── api/          # API client functions
│   │   ├── components/   # Reusable Vue components
│   │   ├── views/        # Page-level Vue components
│   │   ├── router/       # Vue Router configuration
│   │   ├── App.vue       # Root component
│   │   └── main.ts       # Application entry point
│   └── package.json
└── data/              # Uploaded book files and database
```

---

## Backend Conventions

### TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext (ES Modules)
- **Module Resolution**: Node
- **Strict Mode**: Enabled
- **File Extension**: `.ts` with `.js` imports (ES Modules require `.js` in imports)

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Route files | `kebab-case.ts` | `books.ts`, `reading.ts` |
| Middleware | `camelCase.ts` | `errorHandler.ts`, `auth.ts` |
| Models | `camelCase.ts` | `book.ts` |
| Utilities | `camelCase.ts` | `metadata.ts` |

### Express Router Pattern

All routes use the Express Router pattern:

```typescript
import { Router } from 'express';
import { db } from '../models/book.js';

const router = Router();

// Route handlers
router.get('/', (req, res) => { ... });
router.post('/', (req, res) => { ... });
router.get('/:id', (req, res) => { ... });

export default router;
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | `camelCase` | `const books = ...` |
| Functions | `camelCase` | `function extractMetadata()` |
| Interfaces | `PascalCase` | `interface AppError` |
| Type aliases | `PascalCase` | `type Metadata` |
| Constants | `SCREAMING_SNAKE_CASE` | `const SESSION_EXPIRY` |
| Database tables | `snake_case` | `reading_progress`, `bookmarks` |

### API Endpoint Structure

- Base path: `/api`
- Resource-based routing: `/api/books`, `/api/categories`, `/api/reading`
- RESTful conventions:
  - `GET /` - List all
  - `GET /:id` - Get one
  - `POST /` - Create
  - `PUT /:id` - Update (full)
  - `PATCH /:id` - Update (partial)
  - `DELETE /:id` - Delete

### Error Handling Pattern

```typescript
// Route handler pattern
router.get('/:id', (req, res) => {
  try {
    const result = stmt.get(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Operation error:', error);
    res.status(500).json({ error: 'Failed to perform operation' });
  }
});
```

### Database Pattern

Using `better-sqlite3` with synchronous API:

```typescript
import Database from 'better-sqlite3';

const db = new Database(dbPath);

// Schema definition with db.exec()
db.exec(\`CREATE TABLE IF NOT EXISTS books (...)\`);

// Prepared statements pattern
const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
const book = stmt.get(id);

// Export db instance
export { db };
```

---

## Frontend Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Vue components | `PascalCase.vue` | `EpubReader.vue`, `PdfReader.vue` |
| Views (pages) | `PascalCase.vue` | `Upload.vue`, `Admin.vue`, `Reader.vue` |
| API modules | `camelCase.ts` | `books.ts`, `reading.ts` |
| Router config | `index.ts` | `router/index.ts` |

### Vue Component Structure

Using Composition API with `<script setup lang="ts">`:

```vue
<template>
  <div class="component-name">
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// Props definition
const props = defineProps<{
  bookId: number;
  fileUrl: string;
}>();

// Emits definition
const emit = defineEmits<{
  (e: 'progress', data: { page: number; percent: number }): void;
}>();

// Reactive state
const isLoading = ref(false);
const data = ref<Type | null>(null);

// Lifecycle hooks
onMounted(async () => { ... });
</script>

<style scoped>
/* Component styles */
</style>
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Refs | `camelCase` | `const books = ref<Book[]>([])` |
| Functions | `camelCase` | `function loadBooks()` |
| Event handlers | `handle*` prefix | `handleLogin`, `handleDelete` |
| Props | `camelCase` | `bookId`, `fileUrl` |
| Emits | `camelCase` | `'progress'`, `'update'` |
| CSS classes | `kebab-case` | `.book-list`, `.upload-area` |

### API Client Pattern

Axios instance with interceptors:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// API functions return typed responses
export async function getBooks(): Promise<Book[]> {
  const response = await api.get('/books');
  return response.data;
}
```

---

## Key Libraries

| Purpose | Backend | Frontend |
|---------|---------|----------|
| Framework | Express 4.x | Vue 3.x |
| Build | TypeScript (tsc) | Vite 5.x |
| HTTP Client | - | Axios |
| Router | Express Router | Vue Router 4.x |
| Database | better-sqlite3 | - |
| File Upload | Multer | - |
| PDF Reading | - | pdfjs-dist |
| EPUB Reading | - | epubjs |

---

## Security Notes

1. **Authentication**: Simple token-based auth stored in memory (sessions Map)
2. **Token Storage**: localStorage on frontend (consider httpOnly cookies for production)
3. **File Upload**: Restricted to `.epub`, `.pdf`, `.txt` with 50MB limit
4. **CORS**: Currently enabled for all origins (restrict in production)
5. **SQL Injection**: Protected via prepared statements
