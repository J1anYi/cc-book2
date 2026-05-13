import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'data', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
});

export default router;
