import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initDatabase } from './models/book.js';
import booksRouter from './routes/books.js';
import adminRouter from './routes/admin.js';
import categoriesRouter from './routes/categories.js';
import collectionsRouter from './routes/collections.js';
import tagsRouter from './routes/tags.js';
import readingRouter from './routes/reading.js';
import filesRouter from './routes/files.js';
import highlightsRouter from './routes/highlights.js';
import seriesRouter from './routes/series.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

app.use('/api/books', booksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/reading', readingRouter);
app.use('/api/files', filesRouter);
app.use('/api/highlights', highlightsRouter);
app.use('/api/series', seriesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function start() {
  try {
    await initDatabase();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
export { app };
