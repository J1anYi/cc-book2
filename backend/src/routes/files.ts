import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../models/book.js';

const router = Router();

// Serve book file with Range support
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = stmt.get(req.params.id) as { file_path: string; file_type: string; title: string } | undefined;

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const filePath = book.file_path;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Set content type based on file type
    const contentTypes: Record<string, string> = {
      epub: 'application/epub+zip',
      pdf: 'application/pdf',
      txt: 'text/plain'
    };

    const contentType = contentTypes[book.file_type] || 'application/octet-stream';

    if (range) {
      // Handle Range request for partial content
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });

      file.pipe(res);
    } else {
      // Full file request
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType
      });

      const file = fs.createReadStream(filePath);
      file.pipe(res);
    }
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

export default router;
