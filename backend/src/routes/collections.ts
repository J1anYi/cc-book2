import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { collectionSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// GET /api/collections - List all collections with book counts
router.get('/', (req, res) => {
  try {
    const database = db();
    const collections = database.all(`
      SELECT c.*, COUNT(bc.book_id) as book_count
      FROM collections c
      LEFT JOIN book_collections bc ON c.id = bc.collection_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(collections);
  } catch (error) {
    console.error('Failed to get collections:', error);
    res.status(500).json({ error: 'Failed to get collections' });
  }
});

// POST /api/collections - Create new collection
router.post('/', authMiddleware, validateBody(collectionSchema), (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO collections (name, description, icon, color) VALUES (?, ?, ?, ?)',
      [name, description || null, icon || null, color || null]
    );
    database.save();
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      description: description || null,
      icon: icon || null,
      color: color || null,
      book_count: 0
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '收藏夹名称已存在' });
    }
    console.error('Failed to create collection:', error);
    res.status(500).json({ error: '创建收藏夹失败' });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const { name, description, icon, color } = req.body;
    const database = db();

    const existing = database.get('SELECT * FROM collections WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '收藏夹不存在' });
    }

    database.run(
      'UPDATE collections SET name = ?, description = ?, icon = ?, color = ? WHERE id = ?',
      [name, description || null, icon || null, color || null, id]
    );
    database.save();

    const updated = database.get(`
      SELECT c.*, COUNT(bc.book_id) as book_count
      FROM collections c
      LEFT JOIN book_collections bc ON c.id = bc.collection_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '收藏夹名称已存在' });
    }
    console.error('Failed to update collection:', error);
    res.status(500).json({ error: '更新收藏夹失败' });
  }
});

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = req.params as any;
    const database = db();

    const existing = database.get('SELECT * FROM collections WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '收藏夹不存在' });
    }

    // CASCADE will automatically delete book_collections entries
    database.run('DELETE FROM collections WHERE id = ?', [id]);
    database.save();
    res.json({ success: true, message: '收藏夹已删除' });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    res.status(500).json({ error: '删除收藏夹失败' });
  }
});

// POST /api/collections/:id/books/:bookId - Add book to collection
router.post('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id, bookId } = req.params as any;
    const database = db();

    // Verify book exists
    const book = database.get('SELECT id FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: '书籍不存在' });
    }

    // Verify collection exists
    const collection = database.get('SELECT id FROM collections WHERE id = ?', [id]);
    if (!collection) {
      return res.status(404).json({ error: '收藏夹不存在' });
    }

    // Insert (handle duplicate as idempotent success)
    try {
      database.run(
        'INSERT INTO book_collections (book_id, collection_id) VALUES (?, ?)',
        [bookId, id]
      );
      database.save();
    } catch (e: any) {
      if (e.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw e;
      // Already in collection - idempotent success
    }

    res.status(201).json({ success: true, message: '已添加到收藏夹' });
  } catch (error) {
    console.error('Failed to add book to collection:', error);
    res.status(500).json({ error: '添加到收藏夹失败' });
  }
});

// DELETE /api/collections/:id/books/:bookId - Remove book from collection
router.delete('/:id/books/:bookId', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const { id, bookId } = req.params as any;
    const database = db();

    database.run(
      'DELETE FROM book_collections WHERE collection_id = ? AND book_id = ?',
      [id, bookId]
    );
    database.save();
    res.json({ success: true, message: '已从收藏夹移除' });
  } catch (error) {
    console.error('Failed to remove book from collection:', error);
    res.status(500).json({ error: '从收藏夹移除失败' });
  }
});

export default router;
