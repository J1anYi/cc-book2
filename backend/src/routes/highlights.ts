import { Router } from 'express';
import { db } from '../models/book.js';

const router = Router();

// Get all highlights for a book
router.get('/:bookId', (req, res) => {
  try {
    const database = db();
    const highlights = database.all(
      'SELECT * FROM highlights WHERE book_id = ? ORDER BY created_at DESC',
      [req.params.bookId]
    );
    res.json(highlights);
  } catch (error) {
    console.error('Failed to get highlights:', error);
    res.status(500).json({ error: 'Failed to get highlights' });
  }
});

// Add a highlight
router.post('/', (req, res) => {
  try {
    const { book_id, cfi_range, selected_text, color, note, chapter } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO highlights (book_id, cfi_range, selected_text, color, note, chapter) VALUES (?, ?, ?, ?, ?, ?)',
      [book_id, cfi_range, selected_text, color || 'yellow', note || null, chapter || null]
    );
    database.save();
    res.status(201).json({
      id: result.lastInsertRowid,
      book_id,
      cfi_range,
      selected_text,
      color: color || 'yellow',
      note: note || null,
      chapter: chapter || null
    });
  } catch (error) {
    console.error('Failed to add highlight:', error);
    res.status(500).json({ error: 'Failed to add highlight' });
  }
});

// Update a highlight (add/edit note)
router.put('/:id', (req, res) => {
  try {
    const { color, note } = req.body;
    const database = db();
    database.run(
      'UPDATE highlights SET color = ?, note = ? WHERE id = ?',
      [color, note, req.params.id]
    );
    database.save();
    const highlight = database.get('SELECT * FROM highlights WHERE id = ?', [req.params.id]);
    res.json(highlight);
  } catch (error) {
    console.error('Failed to update highlight:', error);
    res.status(500).json({ error: 'Failed to update highlight' });
  }
});

// Delete a highlight
router.delete('/:id', (req, res) => {
  try {
    const database = db();
    database.run('DELETE FROM highlights WHERE id = ?', [req.params.id]);
    database.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete highlight:', error);
    res.status(500).json({ error: 'Failed to delete highlight' });
  }
});

export default router;
