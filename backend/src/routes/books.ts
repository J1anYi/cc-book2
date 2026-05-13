import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/book.js';
import { extractMetadata } from '../utils/metadata.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateQuery, validateParams } from '../middleware/validate.js';
import { bookQuerySchema, idParamSchema } from '../validators/schemas.js';
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
    const fileBuffer = await fs.readFile(req.file.path);
    const validation = await validateFileType(fileBuffer, ext);
    
    if (!validation.valid) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Invalid file type', details: validation.error });
    }

    const fileType = ext.slice(1);
    const metadata = await extractMetadata(req.file.path, fileType);
    const database = db();

    const result = database.run(
      'INSERT INTO books (title, author, file_path, file_type) VALUES (?, ?, ?, ?)',
      [metadata.title || path.basename(req.file.originalname, ext), metadata.author || 'Unknown', req.file.path, fileType]
    );
    await database.save();

    res.status(201).json({ id: result.lastInsertRowid, title: metadata.title, author: metadata.author, fileType });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file?.path) { try { await fs.unlink(req.file.path); } catch {} }
    res.status(500).json({ error: 'Failed to upload book' });
  }
});

router.get('/', validateQuery(bookQuerySchema), (req, res) => {
  const { page = 1, limit = 20, search } = req.query as any;
  const offset = (page - 1) * limit;
  const database = db();

  let sql = 'SELECT * FROM books';
  const params: any[] = [];

  if (search) {
    sql += ' WHERE title LIKE ? OR author LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const books = database.all(sql, params);
  const totalResult = database.get('SELECT COUNT(*) as total FROM books') as { total: number };
  const totalPages = Math.ceil(totalResult.total / limit);

  res.json({ data: books, pagination: { page, limit, total: totalResult.total, totalPages, hasMore: page < totalPages } });
});

router.get('/:id', validateParams(idParamSchema), (req, res) => {
  const database = db();
  const book = database.get('SELECT * FROM books WHERE id = ?', [(req.params as any).id]);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

router.delete('/:id', authMiddleware, validateParams(idParamSchema), async (req, res) => {
  try {
    const database = db();
    const book = database.get('SELECT * FROM books WHERE id = ?', [(req.params as any).id]) as { file_path: string } | undefined;
    if (!book) return res.status(404).json({ error: 'Book not found' });
    try { await fs.unlink(book.file_path); } catch {}
    database.run('DELETE FROM books WHERE id = ?', [(req.params as any).id]);
    await database.save();
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;
