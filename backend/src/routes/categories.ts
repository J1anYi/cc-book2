import { Router } from 'express';
import { db } from '../models/book.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { categorySchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', (req, res) => {
  const database = db();
  const categories = database.all('SELECT * FROM categories ORDER BY name');
  res.json(categories);
});

router.post('/', authMiddleware, validateBody(categorySchema), (req, res) => {
  try {
    const { name } = req.body;
    const database = db();
    const result = database.run('INSERT INTO categories (name) VALUES (?)', [name]);
    database.save();
    res.status(201).json({ id: result.lastInsertRowid, name });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ error: 'Category already exists' });
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;
