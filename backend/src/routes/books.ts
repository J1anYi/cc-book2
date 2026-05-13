import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/book.js';
import { extractMetadata } from '../utils/metadata.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateQuery, validateBody, validateParams } from '../middleware/validate.js';
import { bookQuerySchema, bookSchema, idParamSchema } from '../validators/schemas.js';
import { validateExtension, validateFileType } from '../utils/fileValidator.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'data'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (validateExtension(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only EPUB, PDF, TXT files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/', upload.single('book'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Validate file type by magic number
    const fileBuffer = await fs.readFile(req.file.path);
    const validation = await validateFileType(fileBuffer, ext);
    
    if (!validation.valid) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        error: 'Invalid file type', 
        details: validation.error 
      });
    }

    const fileType = ext.slice(1);
    const metadata = await extractMetadata(req.file.path, fileType);

    const stmt = db.prepare(`
      INSERT INTO books (title, author, file_path, file_type)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      metadata.title || path.basename(req.file.originalname, ext),
      metadata.author || 'Unknown',
      req.file.path,
      fileType
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      title: metadata.title,
      author: metadata.author,
      fileType
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if exists
    if (req.file?.path) {
      try { await fs.unlink(req.file.path); } catch {}
    }
    res.status(500).json({ error: 'Failed to upload book' });
  }
});

router.get('/', validateQuery(bookQuerySchema), (req, res) => {
  const { page = 1, limit = 20, search, category } = req.query as any;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM books';
  let countSql = 'SELECT COUNT(*) as total FROM books';
  const conditions: string[] = [];
  const params: any[] = [];

  if (search && typeof search === 'string') {
    conditions.push('(title LIKE ? OR author LIKE ?)');
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  if (category) {
    conditions.push('category_id = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ');
    sql += whereClause;
    countSql += whereClause;
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const queryParams = [...params, limit, offset];

  const stmt = db.prepare(sql);
  const countStmt = db.prepare(countSql);
  
  const books = stmt.all(...queryParams);
  const totalResult = countStmt.get(...params) as { total: number };
  const total = totalResult.total;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: books,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages
    }
  });
});

router.get('/:id', validateParams(idParamSchema), (req, res) => {
  const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
  const book = stmt.get((req.params as any).id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

router.delete('/:id', authMiddleware, validateParams(idParamSchema), async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = stmt.get((req.params as any).id) as { file_path: string } | undefined;

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Delete file from disk (async)
    try {
      await fs.unlink(book.file_path);
    } catch {
      // File may not exist, continue
    }

    // Delete from database
    const deleteStmt = db.prepare('DELETE FROM books WHERE id = ?');
    deleteStmt.run((req.params as any).id);

    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

router.patch('/:id', authMiddleware, validateParams(idParamSchema), validateBody(bookSchema), (req, res) => {
  try {
    const { title, author, category_id } = req.body;
    const id = (req.params as any).id;

    const stmt = db.prepare(`
      UPDATE books 
      SET title = COALESCE(?, title),
          author = COALESCE(?, author),
          category_id = COALESCE(?, category_id),
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(title, author, category_id, id);

    const updatedStmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const updatedBook = updatedStmt.get(id);

    res.json(updatedBook);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

export default router;
