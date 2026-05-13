import { Router } from 'express';
import { db } from '../models/book.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validators/schemas.js';

const router = Router();

router.get('/history', (req, res) => {
  const database = db();
  const history = database.all('SELECT rp.*, b.title, b.author, b.file_type FROM reading_progress rp JOIN books b ON rp.book_id = b.id ORDER BY rp.last_read_at DESC');
  res.json(history);
});

router.post('/progress', (req, res) => {
  try {
    const { book_id, current_page, current_chapter, progress_percent } = req.body;
    const database = db();
    const existing = database.get('SELECT * FROM reading_progress WHERE book_id = ?', [book_id]);
    if (existing) {
      database.run('UPDATE reading_progress SET current_page = ?, current_chapter = ?, progress_percent = ?, last_read_at = CURRENT_TIMESTAMP WHERE book_id = ?', [current_page, current_chapter, progress_percent, book_id]);
    } else {
      database.run('INSERT INTO reading_progress (book_id, current_page, current_chapter, progress_percent) VALUES (?, ?, ?, ?)', [book_id, current_page, current_chapter, progress_percent]);
    }
    database.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
