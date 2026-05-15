import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/book.js';
import { extractMetadata } from '../utils/metadata.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateQuery, validateParams, validateBody } from '../middleware/validate.js';
import { bookQuerySchema, idParamSchema, readingStatusSchema } from '../validators/schemas.js';
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
  const { page = 1, limit = 20, search, collection_id, status, tags, tagMode = 'OR' } = req.query as any;
  const offset = (page - 1) * limit;
  const database = db();

  let sql = 'SELECT DISTINCT b.* FROM books b';
  const params: any[] = [];
  const conditions: string[] = [];

  // Track if we need JOIN for OR tag filtering
  let needTagJoin = false;

  if (collection_id) {
    sql += ' JOIN book_collections bc ON b.id = bc.book_id';
    conditions.push('bc.collection_id = ?');
    params.push(collection_id);
  }

  if (search) {
    conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push('b.reading_status = ?');
    params.push(status);
  }

  // Tag filtering
  if (tags) {
    const tagIds = (tags as string).split(',').map((t: string) => parseInt(t, 10)).filter((n: number) => !isNaN(n));

    if (tagIds.length > 0) {
      if (tagMode === 'AND') {
        // AND logic: book must have ALL specified tags
        const subquery = `
          b.id IN (
            SELECT bt.book_id
            FROM book_tags bt
            WHERE bt.tag_id IN (${tagIds.map(() => '?').join(',')})
            GROUP BY bt.book_id
            HAVING COUNT(DISTINCT bt.tag_id) = ?
          )
        `;
        conditions.push(subquery);
        params.push(...tagIds, tagIds.length);
      } else {
        // OR logic: book must have ANY of the specified tags
        sql += ' JOIN book_tags bt ON b.id = bt.book_id';
        conditions.push(`bt.tag_id IN (${tagIds.map(() => '?').join(',')})`);
        params.push(...tagIds);
      }
    }
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const books = database.all(sql, params);

  // Count query with same filters
  let countSql = 'SELECT COUNT(DISTINCT b.id) as total FROM books b';
  const countParams: any[] = [];
  const countConditions: string[] = [];

  if (collection_id) {
    countSql += ' JOIN book_collections bc ON b.id = bc.book_id';
    countConditions.push('bc.collection_id = ?');
    countParams.push(collection_id);
  }

  if (search) {
    countConditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    countParams.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    countConditions.push('b.reading_status = ?');
    countParams.push(status);
  }

  // Tag filtering for count query
  if (tags) {
    const tagIds = (tags as string).split(',').map((t: string) => parseInt(t, 10)).filter((n: number) => !isNaN(n));

    if (tagIds.length > 0) {
      if (tagMode === 'AND') {
        // AND logic for count
        const subquery = `
          b.id IN (
            SELECT bt.book_id
            FROM book_tags bt
            WHERE bt.tag_id IN (${tagIds.map(() => '?').join(',')})
            GROUP BY bt.book_id
            HAVING COUNT(DISTINCT bt.tag_id) = ?
          )
        `;
        countConditions.push(subquery);
        countParams.push(...tagIds, tagIds.length);
      } else {
        // OR logic for count
        countSql += ' JOIN book_tags bt ON b.id = bt.book_id';
        countConditions.push(`bt.tag_id IN (${tagIds.map(() => '?').join(',')})`);
        countParams.push(...tagIds);
      }
    }
  }

  if (countConditions.length > 0) {
    countSql += ' WHERE ' + countConditions.join(' AND ');
  }

  const totalResult = database.get(countSql, countParams) as { total: number };
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

router.patch('/:id', authMiddleware, validateParams(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const { category, tags, category_id } = req.body;

    const database = db();
    const book = database.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];

    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(tags);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    database.run(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`, params);
    await database.save();

    const updatedBook = database.get('SELECT * FROM books WHERE id = ?', [id]);
    res.json(updatedBook);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Update reading status
router.put('/:id/status', validateParams(idParamSchema), validateBody(readingStatusSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const { status } = req.body;

    const database = db();
    const book = database.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    database.run('UPDATE books SET reading_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    await database.save();

    const updatedBook = database.get('SELECT * FROM books WHERE id = ?', [id]);
    res.json(updatedBook);
  } catch (error) {
    console.error('Update reading status error:', error);
    res.status(500).json({ error: '更新阅读状态失败' });
  }
});

export default router;