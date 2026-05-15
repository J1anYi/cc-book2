import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { tagSchema, setBookTagsSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// GET /api/tags - List all tags with usage counts
router.get('/', (req, res) => {
  try {
    const database = db();
    const tags = database.all(`
      SELECT t.*, COUNT(bt.book_id) as usage_count
      FROM tags t
      LEFT JOIN book_tags bt ON t.id = bt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `);
    res.json(tags);
  } catch (error) {
    console.error('Failed to get tags:', error);
    res.status(500).json({ error: '获取标签列表失败' });
  }
});

// POST /api/tags - Create new tag
router.post('/', authMiddleware, validateBody(tagSchema), (req, res) => {
  try {
    const { name, color } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO tags (name, color) VALUES (?, ?)',
      [name, color || null]
    );
    database.save();
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      color: color || null,
      usage_count: 0
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('CONSTRAINT')) {
      return res.status(409).json({ error: '标签名称已存在' });
    }
    console.error('Failed to create tag:', error);
    res.status(500).json({ error: '创建标签失败' });
  }
});

// PUT /api/tags/:id - Update tag
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(tagSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const { name, color } = req.body;
    const database = db();

    const existing = database.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '标签不存在' });
    }

    database.run(
      'UPDATE tags SET name = ?, color = ? WHERE id = ?',
      [name, color || null, id]
    );
    database.save();

    const updated = database.get(`
      SELECT t.*, COUNT(bt.book_id) as usage_count
      FROM tags t
      LEFT JOIN book_tags bt ON t.id = bt.tag_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [id]);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('CONSTRAINT')) {
      return res.status(409).json({ error: '标签名称已存在' });
    }
    console.error('Failed to update tag:', error);
    res.status(500).json({ error: '更新标签失败' });
  }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const existing = database.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '标签不存在' });
    }

    // CASCADE will automatically delete book_tags entries
    database.run('DELETE FROM tags WHERE id = ?', [id]);
    database.save();
    res.json({ success: true, message: '标签已删除' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    res.status(500).json({ error: '删除标签失败' });
  }
});

// GET /api/tags/book/:bookId - Get tags for a specific book
router.get('/book/:bookId', (req, res) => {
  try {
    const { bookId } = req.params as any;
    const database = db();
    const tags = database.all(`
      SELECT t.*
      FROM tags t
      JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id = ?
      ORDER BY t.name
    `, [bookId]);
    res.json(tags);
  } catch (error) {
    console.error('Failed to get book tags:', error);
    res.status(500).json({ error: '获取书籍标签失败' });
  }
});

// POST /api/tags/books/:bookId - Set tags for a book (replace all)
router.post('/books/:bookId', authMiddleware, validateParams(idParamSchema), validateBody(setBookTagsSchema), (req, res) => {
  try {
    const { bookId } = req.params as any;
    const { tagIds } = req.body;
    const database = db();

    // Verify book exists
    const book = database.get('SELECT id FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    // Remove existing tags for this book
    database.run('DELETE FROM book_tags WHERE book_id = ?', [bookId]);

    // Insert new tags
    for (const tagId of tagIds) {
      // Verify tag exists
      const tag = database.get('SELECT id FROM tags WHERE id = ?', [tagId]);
      if (tag) {
        database.run(
          'INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)',
          [bookId, tagId]
        );
      }
    }

    database.save();

    // Return updated tag list for this book
    const tags = database.all(`
      SELECT t.*
      FROM tags t
      JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id = ?
      ORDER BY t.name
    `, [bookId]);
    res.json(tags);
  } catch (error) {
    console.error('Failed to set book tags:', error);
    res.status(500).json({ error: '设置书籍标签失败' });
  }
});

export default router;