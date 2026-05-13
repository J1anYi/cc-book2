import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../models/book.js';

const router = Router();

// Serve book file by book ID
router.get('/:id', (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const database = db();
    const book = database.get('SELECT file_path, file_type FROM books WHERE id = ?', [bookId]) as { file_path: string; file_type: string } | undefined;

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!fs.existsSync(book.file_path)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate content type
    const contentTypes: Record<string, string> = {
      'epub': 'application/epub+zip',
      'pdf': 'application/pdf',
      'txt': 'text/plain'
    };

    const contentType = contentTypes[book.file_type.toLowerCase()] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.sendFile(book.file_path);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Serve cover images
router.get('/covers/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'data', 'covers', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Cover not found' });
  }
  res.sendFile(filePath);
});

export default router;
