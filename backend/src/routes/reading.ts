import { Router } from 'express';
import { db } from '../models/book.js';

const router = Router();

router.get('/history', (req, res) => {
  const database = db();
  const history = database.all('SELECT rp.*, b.title, b.author, b.file_type FROM reading_progress rp JOIN books b ON rp.book_id = b.id ORDER BY rp.last_read_at DESC');
  res.json(history);
});

router.get('/progress/:id', (req, res) => {
  try {
    const database = db();
    const progress = database.get('SELECT * FROM reading_progress WHERE book_id = ?', [req.params.id]);
    res.json(progress || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
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

// Bookmarks
router.get('/bookmarks/:bookId', (req, res) => {
  try {
    const database = db();
    const bookmarks = database.all('SELECT * FROM bookmarks WHERE book_id = ? ORDER BY created_at DESC', [req.params.bookId]);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

router.post('/bookmarks', (req, res) => {
  try {
    const { book_id, page_number, chapter, position, note } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO bookmarks (book_id, page_number, chapter, position, note) VALUES (?, ?, ?, ?, ?)',
      [book_id, page_number || null, chapter || null, position || null, note || null]
    );
    database.save();
    res.status(201).json({ id: result.lastInsertRowid, book_id, page_number, chapter, position, note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

router.delete('/bookmarks/:id', (req, res) => {
  try {
    const database = db();
    database.run('DELETE FROM bookmarks WHERE id = ?', [req.params.id]);
    database.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// Notes
router.get('/notes/:bookId', (req, res) => {
  try {
    const database = db();
    const notes = database.all('SELECT * FROM notes WHERE book_id = ? ORDER BY created_at DESC', [req.params.bookId]);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

router.post('/notes', (req, res) => {
  try {
    const { book_id, page_number, chapter, position, content, color } = req.body;
    const database = db();
    const result = database.run(
      'INSERT INTO notes (book_id, page_number, chapter, position, content, color) VALUES (?, ?, ?, ?, ?, ?)',
      [book_id, page_number || null, chapter || null, position || null, content, color || 'yellow']
    );
    database.save();
    res.status(201).json({ id: result.lastInsertRowid, book_id, page_number, chapter, position, content, color });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

router.put('/notes/:id', (req, res) => {
  try {
    const { content, color } = req.body;
    const database = db();
    database.run(
      'UPDATE notes SET content = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content, color || 'yellow', req.params.id]
    );
    database.save();
    const note = database.get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/notes/:id', (req, res) => {
  try {
    const database = db();
    database.run('DELETE FROM notes WHERE id = ?', [req.params.id]);
    database.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
