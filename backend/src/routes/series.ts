import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { seriesSchema, idParamSchema, setBookSeriesSchema } from '../validators/schemas.js';
import { detectSeriesInfo } from '../utils/seriesDetection.js';

const router = Router();

// GET /api/series - List all series with book counts
router.get('/', (req, res) => {
  try {
    const database = db();
    const series = database.all(`
      SELECT
        s.*,
        COUNT(b.id) as book_count,
        MIN(b.series_index) as min_index,
        MAX(b.series_index) as max_index
      FROM series s
      LEFT JOIN books b ON b.series_id = s.id
      GROUP BY s.id
      ORDER BY s.name
    `);
    res.json(series);
  } catch (error) {
    console.error('Failed to get series:', error);
    res.status(500).json({ error: '获取系列列表失败' });
  }
});

// GET /api/series/:id - Get series with books in order
router.get('/:id', validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const series = database.get('SELECT * FROM series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: '系列不存在' });
    }

    const books = database.all(`
      SELECT * FROM books
      WHERE series_id = ?
      ORDER BY series_index ASC, created_at ASC
    `, [id]);

    res.json({ ...series, books });
  } catch (error) {
    console.error('Failed to get series:', error);
    res.status(500).json({ error: '获取系列详情失败' });
  }
});

// POST /api/series - Create new series
router.post('/', authMiddleware, validateBody(seriesSchema), (req, res) => {
  try {
    const { name, description } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO series (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    database.save();
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      description: description || null,
      book_count: 0
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '系列名称已存在' });
    }
    console.error('Failed to create series:', error);
    res.status(500).json({ error: '创建系列失败' });
  }
});

// PUT /api/series/:id - Update series
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(seriesSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const { name, description } = req.body;
    const database = db();

    const existing = database.get('SELECT * FROM series WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '系列不存在' });
    }

    database.run(
      'UPDATE series SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    database.save();

    const updated = database.get(`
      SELECT
        s.*,
        COUNT(b.id) as book_count
      FROM series s
      LEFT JOIN books b ON b.series_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '系列名称已存在' });
    }
    console.error('Failed to update series:', error);
    res.status(500).json({ error: '更新系列失败' });
  }
});

// DELETE /api/series/:id - Delete series (books' series_id set to NULL via ON DELETE SET NULL)
router.delete('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const existing = database.get('SELECT * FROM series WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '系列不存在' });
    }

    // ON DELETE SET NULL will automatically clear series_id on books
    database.run('DELETE FROM series WHERE id = ?', [id]);
    database.save();
    res.json({ success: true, message: '系列已删除' });
  } catch (error) {
    console.error('Failed to delete series:', error);
    res.status(500).json({ error: '删除系列失败' });
  }
});

// PUT /api/series/:id/books/:bookId - Add book to series
router.put('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id, bookId } = req.params as any;
    const { index } = req.body;
    const database = db();

    // Verify book exists
    const book = database.get('SELECT id, series_id FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    // Verify series exists
    const series = database.get('SELECT id FROM series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: '系列不存在' });
    }

    // Calculate index if not provided
    let seriesIndex = index;
    if (seriesIndex === undefined || seriesIndex === null) {
      const maxIndex = database.get(
        'SELECT MAX(series_index) as max FROM books WHERE series_id = ?',
        [id]
      );
      seriesIndex = (maxIndex.max || 0) + 1;
    }

    database.run(
      'UPDATE books SET series_id = ?, series_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id, seriesIndex, bookId]
    );
    database.save();

    const updatedBook = database.get('SELECT * FROM books WHERE id = ?', [bookId]);
    res.json(updatedBook);
  } catch (error) {
    console.error('Failed to add book to series:', error);
    res.status(500).json({ error: '添加到系列失败' });
  }
});

// DELETE /api/series/:id/books/:bookId - Remove book from series
router.delete('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { bookId } = req.params as any;
    const database = db();

    database.run(
      'UPDATE books SET series_id = NULL, series_index = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [bookId]
    );
    database.save();
    res.json({ success: true, message: '已从系列移除' });
  } catch (error) {
    console.error('Failed to remove book from series:', error);
    res.status(500).json({ error: '从系列移除失败' });
  }
});

// POST /api/series/detect - Auto-detect series info from book titles
router.post('/detect', authMiddleware, (req, res) => {
  try {
    const { bookIds } = req.body;
    const database = db();

    const results: Array<{
      bookId: number;
      title: string;
      detected: { seriesName: string; index: number } | null;
    }> = [];

    for (const bookId of bookIds) {
      const book = database.get('SELECT id, title FROM books WHERE id = ?', [bookId]);
      if (book) {
        const detected = detectSeriesInfo(book.title);
        results.push({
          bookId: book.id,
          title: book.title,
          detected
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Failed to detect series info:', error);
    res.status(500).json({ error: '检测系列信息失败' });
  }
});

// POST /api/series/reorder - Reorder books within a series
router.post('/reorder', authMiddleware, (req, res) => {
  try {
    const { seriesId, bookIds } = req.body; // bookIds in new order
    const database = db();

    // Assign new indices (1, 2, 3, ...)
    for (let i = 0; i < bookIds.length; i++) {
      database.run(
        'UPDATE books SET series_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND series_id = ?',
        [i + 1, bookIds[i], seriesId]
      );
    }
    database.save();

    const books = database.all(
      'SELECT * FROM books WHERE series_id = ? ORDER BY series_index ASC',
      [seriesId]
    );
    res.json(books);
  } catch (error) {
    console.error('Failed to reorder series:', error);
    res.status(500).json({ error: '重新排序失败' });
  }
});

export default router;
