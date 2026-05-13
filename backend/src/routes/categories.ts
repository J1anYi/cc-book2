import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { categorySchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// Get all categories
router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  const categories = stmt.all();
  res.json(categories);
});

// Get category by ID
router.get('/:id', validateParams(idParamSchema), (req, res) => {
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
  const category = stmt.get((req.params as any).id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

// Create category
router.post('/', authMiddleware, validateBody(categorySchema), (req, res) => {
  try {
    const { name } = req.body;

    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const result = stmt.run(name);

    res.status(201).json({
      id: result.lastInsertRowid,
      name
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(categorySchema), (req, res) => {
  try {
    const { name } = req.body;
    const id = (req.params as any).id;

    const stmt = db.prepare('UPDATE categories SET name = ? WHERE id = ?');
    const result = stmt.run(name, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedStmt = db.prepare('SELECT * FROM categories WHERE id = ?');
    const updatedCategory = updatedStmt.get(id);

    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', authMiddleware, validateParams(idParamSchema), (req, res) => {
  try {
    const id = (req.params as any).id;
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
