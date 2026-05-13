import { Router } from 'express';
import { db } from '../models/book.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { progressSchema, bookmarkSchema, noteSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// Get reading progress for a book
router.get('/progress/:bookId', validateParams(idParamSchema), (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM reading_progress WHERE book_id = ?');
    const progress = stmt.get((req.params as any).bookId);
    res.json(progress || null);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get reading progress' });
  }
});

// Save reading progress
router.post('/progress', validateBody(progressSchema), (req, res) => {
  try {
    const { book_id, current_page, current_chapter, progress_percent } = req.body;

    // Check if progress exists
    const existingStmt = db.prepare('SELECT * FROM reading_progress WHERE book_id = ?');
    const existing = existingStmt.get(book_id);

    if (existing) {
      // Update
      const updateStmt = db.prepare(`
        UPDATE reading_progress
        SET current_page = ?, current_chapter = ?, progress_percent = ?, last_read_at = CURRENT_TIMESTAMP
        WHERE book_id = ?
      `);
      updateStmt.run(current_page, current_chapter, progress_percent, book_id);
    } else {
      // Insert
      const insertStmt = db.prepare(`
        INSERT INTO reading_progress (book_id, current_page, current_chapter, progress_percent)
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(book_id, current_page, current_chapter, progress_percent);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Failed to save reading progress' });
  }
});

// Get reading history
router.get('/history', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT rp.*, b.title, b.author, b.file_type, b.cover_path
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      ORDER BY rp.last_read_at DESC
    `);
    const history = stmt.all();
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get reading history' });
  }
});

// Get bookmarks for a book
router.get('/bookmarks/:bookId', validateParams(idParamSchema), (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM bookmarks WHERE book_id = ? ORDER BY created_at DESC');
    const bookmarks = stmt.all((req.params as any).bookId);
    res.json(bookmarks);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

// Add bookmark
router.post('/bookmarks', validateBody(bookmarkSchema), (req, res) => {
  try {
    const { book_id, page_number, chapter, position, note } = req.body;

    const stmt = db.prepare(`
      INSERT INTO bookmarks (book_id, page_number, chapter, position, note)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(book_id, page_number, chapter, position, note);

    res.status(201).json({
      id: result.lastInsertRowid,
      book_id,
      page_number,
      chapter,
      position,
      note
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Delete bookmark
router.delete('/bookmarks/:id', validateParams(idParamSchema), (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM bookmarks WHERE id = ?');
    stmt.run((req.params as any).id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// Get notes for a book
router.get('/notes/:bookId', validateParams(idParamSchema), (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM notes WHERE book_id = ? ORDER BY created_at DESC');
    const notes = stmt.all((req.params as any).bookId);
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

// Add note
router.post('/notes', validateBody(noteSchema), (req, res) => {
  try {
    const { book_id, page_number, chapter, position, content, color } = req.body;

    const stmt = db.prepare(`
      INSERT INTO notes (book_id, page_number, chapter, position, content, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(book_id, page_number, chapter, position, content, color || 'yellow');

    res.status(201).json({
      id: result.lastInsertRowid,
      book_id,
      page_number,
      chapter,
      position,
      content,
      color: color || 'yellow'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Update note
router.put('/notes/:id', validateParams(idParamSchema), validateBody(noteSchema), (req, res) => {
  try {
    const { content, color } = req.body;
    const id = (req.params as any).id;

    const stmt = db.prepare(`
      UPDATE notes SET content = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    stmt.run(content, color, id);

    const selectStmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    const updatedNote = selectStmt.get(id);

    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/notes/:id', validateParams(idParamSchema), (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run((req.params as any).id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
