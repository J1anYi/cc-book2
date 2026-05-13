import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const TOKEN_EXPIRY = '24h';

// Token blacklist for logout (in production, use Redis)
const tokenBlacklist: Set<string> = new Set();

export interface JWTPayload {
  iat: number;
  exp: number;
}

export function login(password: string): { success: boolean; token?: string } {
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({}, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return { success: true, token };
  }
  return { success: false };
}

export function validateToken(token: string): boolean {
  if (tokenBlacklist.has(token)) {
    return false;
  }
  
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function invalidateToken(token: string): void {
  tokenBlacklist.add(token);
  // Clean up expired tokens periodically (simple approach)
  if (tokenBlacklist.size > 10000) {
    // In production, use proper token cleanup with Redis TTL
    tokenBlacklist.clear();
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  if (!validateToken(token)) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  next();
}
