import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        res.status(400).json({
          error: 'Validation failed',
          details: (error as any).errors
        });
        return;
      }
      res.status(400).json({ error: 'Invalid input' });
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        res.status(400).json({
          error: 'Validation failed',
          details: (error as any).errors
        });
        return;
      }
      res.status(400).json({ error: 'Invalid query parameters' });
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        res.status(400).json({
          error: 'Validation failed',
          details: (error as any).errors
        });
        return;
      }
      res.status(400).json({ error: 'Invalid parameters' });
    }
  };
}
