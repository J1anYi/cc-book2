# Testing Patterns

**Analysis Date:** 2026-05-13

## Test Framework

**Runner:**
- None currently installed
- Recommended: Jest (backend), Vitest (frontend)

**Assertion Library:**
- None currently installed

**Run Commands:**
```bash
# None defined - proposed:
cd backend && npm test          # Run all backend tests
cd frontend && npm test         # Run all frontend tests
cd frontend && npm run test:watch  # Watch mode
cd frontend && npm run test:coverage # Coverage
```

## Current State

**No automated tests exist.** The project has:
- Zero test files (*.test.ts, *.spec.ts)
- No testing frameworks in either package.json
- No test scripts defined
- No CI/CD pipeline configured
- No test configuration files

## Test File Organization

**Proposed Location:**
- Co-located with source files (same directory)

**Naming:**
- <filename>.test.ts for test files

**Structure:**
```
backend/src/
├── routes/
│   ├── books.ts
│   ├── books.test.ts        # Route integration tests
│   ├── categories.ts
│   ├── categories.test.ts
│   ├── reading.ts
│   └── reading.test.ts
├── middleware/
│   ├── auth.ts
│   └── auth.test.ts         # Middleware unit tests
├── models/
│   └── book.ts              # Schema - test via routes
└── utils/
    ├── metadata.ts
    └── metadata.test.ts     # Utility unit tests

frontend/src/
├── api/
│   ├── books.ts
│   └── books.test.ts        # API client unit tests
├── components/
│   ├── EpubReader.vue
│   └── EpubReader.test.ts   # Component tests
├── views/
│   ├── Upload.vue
│   └── Upload.test.ts
└── router/
    └── index.ts
        index.test.ts        # Router guard tests
```

## Test Structure

**Suite Organization:**
```typescript
describe('Books API', () => {
  describe('GET /api/books', () => {
    it('should return list of books', async () => {
      // Test implementation
    });
  });
});
```

## Mocking

**Backend Mocking Patterns:**
```typescript
// Database: use in-memory SQLite
const testDb = new Database(':memory:');

// File system mocking
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn()
}));
```

**Frontend Mocking Patterns:**
```typescript
// API module mocking
vi.mock('../api/books', () => ({
  getBooks: vi.fn().mockResolvedValue([])
}));

// LocalStorage mocking
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn()
};
```

**What to Mock:**
- External HTTP calls
- File system operations
- Third-party reader libraries (epubjs, pdfjs-dist)
- localStorage/sessionStorage

**What NOT to Mock:**
- Route handler logic (test via supertest)
- Vue reactivity system
- TypeScript type checking

## Fixtures and Factories

**Test Data:**
```typescript
export const mockBook = {
  title: 'Test Book',
  author: 'Test Author',
  file_path: '/data/test-book.epub',
  file_type: 'epub'
};
```

**Location:**
- backend/test/fixtures/ - Test files and sample data
- frontend/src/api/__mocks__/ - API response mocks

## Coverage

**Requirements:** None enforced. Recommended target: 70% for core logic.

**View Coverage:**
```bash
cd backend && npx jest --coverage
cd frontend && npx vitest --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, middleware, utility methods
- Priority targets: auth.ts, metadata.ts, API modules

**Integration Tests:**
- Scope: Full request/response cycle through Express
- Approach: Use supertest with real (in-memory) database
- Priority targets: All route files

**E2E Tests:**
- Not currently used
- Recommended tool: Playwright or Cypress

## Common Patterns

**Async Testing:**
```typescript
// Backend - supertest
it('should return books', async () => {
  const response = await request(app)
    .get('/api/books')
    .expect(200);
});

// Frontend - async component behavior
it('should load books on mount', async () => {
  const wrapper = mount(Upload);
  await flushPromises();
});
```

**Error Testing:**
```typescript
it('should return 404 for missing book', async () => {
  const response = await request(app)
    .get('/api/books/9999')
    .expect(404);
});
```

**Auth-Protected Endpoint Testing:**
```typescript
it('should reject unauthenticated delete', async () => {
  await request(app).delete('/api/books/1').expect(401);
});
```

## Test Coverage Gaps

**Backend - Critical Untested Areas:**
- books.ts - File upload validation, CRUD operations
- auth.ts - Token validation, session management
- reading.ts - Progress save/resume, bookmarks
- files.ts - Range request handling
- metadata.ts - Metadata extraction

**Frontend - Critical Untested Areas:**
- api/books.ts - Axios interceptor, typed API functions
- router/index.ts - Auth guard logic
- views/Upload.vue - File selection, upload state
- views/Admin.vue - Login flow, CRUD operations

## Recommended Setup Commands

```bash
# Backend testing setup
cd backend
npm install -D jest ts-jest @types/jest supertest @types/supertest

# Frontend testing setup
cd frontend
npm install -D vitest @vue/test-utils happy-dom
```
