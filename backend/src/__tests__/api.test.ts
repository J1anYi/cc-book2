import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import booksRouter from '../routes/books.js';
import adminRouter from '../routes/admin.js';
import { errorHandler } from '../middleware/errorHandler.js';

// Create test app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/books', booksRouter);
app.use('/api/admin', adminRouter);
app.use(errorHandler);

describe('Health Check', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('Admin Endpoints', () => {
  it('should reject login without password', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should login with correct password', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Books Endpoints', () => {
  it('should list books with pagination', async () => {
    const res = await request(app)
      .get('/api/books')
      .query({ page: 1, limit: 10 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('should reject invalid page parameter', async () => {
    const res = await request(app)
      .get('/api/books')
      .query({ page: -1 });
    expect(res.status).toBe(400);
  });

  it('should reject invalid book id', async () => {
    const res = await request(app).get('/api/books/invalid');
    expect(res.status).toBe(400);
  });
});

describe('Categories Endpoints', () => {
  it('should list categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
