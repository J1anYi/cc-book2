import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/book.js';
import { extractMetadata } from '../utils/metadata.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'data'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.epub', '.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only EPUB, PDF, TXT files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/', upload.single('book'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
    const metadata = await extractMetadata(req.file.path, fileType);

    const stmt = db.prepare(`
      INSERT INTO books (title, author, file_path, file_type)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      metadata.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
      metadata.author || 'Unknown',
      req.file.path,
      fileType
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      title: metadata.title,
      author: metadata.author,
      fileType
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload book' });
  }
});

router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT * FROM books ORDER BY created_at DESC');
  const books = stmt.all();
  res.json(books);
});

router.get('/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
  const book = stmt.get(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

export default router;
