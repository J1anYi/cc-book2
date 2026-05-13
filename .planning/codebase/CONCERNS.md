# Technical Concerns and Observations

## Security Concerns

### Critical

1. **Hardcoded Default Credentials** (backend/src/middleware/auth.ts:3-4)
   - Default password 'admin123' and session token 'secret-token-123' are hardcoded
   - These defaults are used if environment variables are not set
   - Risk: Production deployments may use insecure defaults if env vars not configured

2. **Weak Token Generation** (backend/src/middleware/auth.ts:16)
   - Token is simple Base64 encoding of timestamp + static secret
   - No cryptographic signing (JWT) or random token generation
   - Risk: Tokens can be predicted or forged

3. **No Rate Limiting on Authentication**
   - Login endpoint has no brute-force protection
   - Risk: Password can be guessed through repeated attempts

4. **Session Storage in Memory** (backend/src/middleware/auth.ts:12)
   - Sessions stored in a Map, lost on server restart
   - No persistence or distributed session support
   - Risk: All users logged out on server restart; does not scale horizontally

5. **Incomplete Logout Implementation** (backend/src/routes/admin.ts:22-26)
   - Comment indicates token invalidation not implemented
   - Tokens remain valid after logout
   - Risk: Logged-out sessions remain active

### High

6. **CORS Allows All Origins** (backend/src/index.ts:12)
   - app.use(cors()) with no configuration allows any origin
   - Risk: Cross-site request forgery (CSRF) attacks possible

7. **File Upload Path Construction** (backend/src/routes/books.ts:14)
   - Uses process.cwd() which could be manipulated
   - No path traversal validation on uploaded filenames
   - Risk: Potential directory traversal if process cwd is unexpected

8. **File Type Validation by Extension Only** (backend/src/routes/books.ts:24-31)
   - Only checks file extension, not actual content/MIME type
   - Risk: Malicious files with valid extensions could be uploaded

9. **No Input Validation/Sanitization**
   - Most endpoints accept raw request body without validation
   - No library like Joi, Zod, or express-validator used
   - Risk: Invalid or malicious data could cause issues

### Medium

10. **No HTTPS Enforcement**
    - No HSTS headers or HTTPS redirect
    - Risk: Credentials transmitted in plain text in production

11. **SQL Query Construction** (backend/src/routes/books.ts:72-78)
    - Dynamic SQL with string concatenation for search
    - While using prepared statements, the query structure is dynamic
    - Risk: Potential SQL injection if search parameter contains special characters

12. **Error Messages May Leak Information**
    - Development mode exposes stack traces
    - Generic errors may still reveal internal paths
    - Risk: Information disclosure for attackers

---

## Performance Concerns

### High

1. **No Pagination for Book Lists** (backend/src/routes/books.ts:69-86)
   - Returns all books in single response
   - Impact: Memory and bandwidth issues with large libraries

2. **Synchronous File Operations** (backend/src/routes/files.ts:19, backend/src/routes/books.ts:107-108)
   - fs.statSync(), fs.existsSync(), fs.unlinkSync() used
   - Impact: Blocks event loop during file operations

3. **No Caching Strategy**
   - No caching for book metadata, categories, or frequently accessed data
   - Impact: Repeated database queries for static data

### Medium

4. **Large File Upload Handling**
   - 50MB limit but no streaming validation
   - Entire file buffered before validation
   - Impact: Memory pressure during uploads

5. **PDF.js Worker from CDN** (frontend/src/components/PdfReader.vue:20)
   - Worker loaded from cdnjs
   - Impact: Network latency, availability dependency

6. **No Database Indexing**
   - No explicit indexes created on frequently queried columns
   - Search queries on title/author without indexes
   - Impact: Slow searches as library grows

---

## Scalability Limitations

1. **SQLite Database**
   - Single-file database not suitable for concurrent writes
   - No support for horizontal scaling
   - Limitation: Single server architecture only

2. **In-Memory Sessions**
   - Cannot share sessions across multiple server instances
   - Limitation: No load balancing possible

3. **No Connection Pooling**
   - SQLite opens single connection at startup
   - Limitation: May become bottleneck under load

4. **File Storage on Local Disk**
   - Files stored in local data/ directory
   - Limitation: Cannot scale to multiple servers or cloud storage

---

## Technical Debt Indicators

### Incomplete Features

1. **Metadata Extraction Not Implemented** (backend/src/utils/metadata.ts:26,35)
   - EPUB and PDF metadata extraction marked as TODO
   - Currently returns only filename as title
   - Impact: Poor user experience, manual metadata entry needed

2. **Error Handler Middleware Unused** (backend/src/middleware/errorHandler.ts)
   - Error handling utilities created but not registered in app
   - Routes use inline try-catch instead
   - Impact: Inconsistent error handling

### Code Quality Issues

3. **Type Safety Gaps**
   - 'any' type used in multiple places (frontend/src/views/Reader.vue:78, frontend/src/views/Admin.vue:42)
   - @ts-ignore comment in EpubReader (frontend/src/components/EpubReader.vue:57)
   - Impact: Potential runtime errors

4. **No Test Coverage**
   - No test files found in project
   - No testing framework configured
   - Impact: No regression protection

5. **Mixed Error Handling Patterns**
   - Some routes use try-catch with console.error
   - Error handler middleware exists but unused
   - Impact: Inconsistent error responses

---

## Code Smells and Anti-Patterns

1. **Hardcoded Configuration Values**
   - Port numbers: 3000, 5173
   - File size limit: 50 * 1024 * 1024
   - Session expiry: 24 * 60 * 60 * 1000
   - Smell: Configuration scattered, not centralized

2. **Duplicate Logic**
   - Similar try-catch patterns repeated in every route
   - Book fetching logic duplicated
   - Smell: Could be extracted to middleware or utilities

3. **Inconsistent Response Formats**
   - Some errors return { error: message }
   - Others return { status, message }
   - Smell: No standard API response envelope

4. **Frontend State Management**
   - No Pinia/Vuex store
   - API calls and state in components
   - Smell: State logic mixed with presentation

---

## Missing Error Handling

1. **Book ID Validation** (backend/src/routes/reading.ts)
   - Routes assume book exists when saving progress/bookmarks/notes
   - No foreign key constraint enforcement at application level
   - Risk: Orphaned records if book deleted

2. **File Operation Errors** (backend/src/routes/files.ts:18-19)
   - No try-catch around fs.statSync() before range handling
   - Risk: Crash if file deleted after database record created

3. **Upload Failure Cleanup**
   - If database insert fails after file upload, file remains on disk
   - Risk: Orphaned files consuming storage

4. **EPUB/PDF Loading Errors** (frontend/src/components/EpubReader.vue:86-88)
   - Errors only logged to console
   - No user-facing error message
   - Risk: Silent failures confuse users

---

## Dependency Risks

1. **External CDN Dependencies**
   - PDF.js worker from cdnjs.cloudflare.com
   - Risk: Availability depends on CDN uptime

2. **Loose Version Pinning**
   - Dependencies use ^ version ranges
   - Risk: Unexpected breaking changes on npm install

3. **Unpinned Frontend Dependencies**
   - epubjs, pdfjs-dist versions not visible in analysis
   - Risk: Version drift between environments

4. **Missing Security Packages**
   - No helmet for security headers
   - No express-rate-limit for brute force protection
   - No input validation library
   - Risk: Common attack vectors unprotected

---

## Configuration Concerns

1. **No Environment-Based Configuration**
   - Only ADMIN_PASSWORD and SESSION_TOKEN from env
   - Port, database path, file limits hardcoded
   - Issue: Difficult to configure for different environments

2. **No Production Optimization**
   - No production build configuration visible
   - No environment detection
   - Issue: May run with development settings in production

3. **Database Path** (backend/src/models/book.ts:4)
   - Uses process.cwd() for database location
   - Issue: Location depends on where server is started from

---

## Areas Needing Attention

### Immediate Priority

1. Replace hardcoded credentials with required environment variables
2. Implement proper token generation (JWT or random tokens)
3. Add rate limiting to login endpoint
4. Configure CORS with specific allowed origins
5. Add input validation to all endpoints

### Short Term

1. Implement pagination for book listing
2. Add file content type validation (magic number checking)
3. Complete metadata extraction for EPUB/PDF
4. Add database indexes for search columns
5. Implement proper logout with token invalidation

### Medium Term

1. Add test coverage (unit and integration tests)
2. Implement proper error handling middleware
3. Add caching layer for frequently accessed data
4. Consider migrating to PostgreSQL for scalability
5. Add session persistence (Redis or database)

### Long Term

1. Consider cloud storage for uploaded files
2. Implement horizontal scaling support
3. Add monitoring and logging infrastructure
4. Consider adding API documentation (OpenAPI/Swagger)
5. Implement proper state management in frontend (Pinia)
