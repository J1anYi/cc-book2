import { z } from 'zod';

// Book creation/update schema
export const bookSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  author: z.string().max(200).optional(),
  category_id: z.number().int().positive().optional(),
});

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// Collection schema
export const collectionSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过100字符'),
  description: z.string().max(500, '描述不能超过500字符').optional(),
  icon: z.string().max(10, '图标不能超过10字符').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$|^$/, '颜色格式无效').optional(),
});

// Reading progress schema
export const progressSchema = z.object({
  progress: z.number().min(0).max(1),
});

// Bookmark schema
export const bookmarkSchema = z.object({
  chapter: z.number().int().min(0),
  location: z.string().max(1000),
  note: z.string().max(2000).optional(),
});

// Note schema
export const noteSchema = z.object({
  chapter: z.number().int().min(0),
  location: z.string().max(1000),
  content: z.string().min(1).max(10000),
  highlight: z.string().max(500).optional(),
});

// Login schema
export const loginSchema = z.object({
  password: z.string().min(1),
});

// Book list query schema
export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.coerce.number().int().positive().optional(),
  collection_id: z.coerce.number().int().positive().optional(),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Collection book params schema (for routes with :id and :bookId)
export const collectionBookParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  bookId: z.coerce.number().int().positive(),
});

// Type exports
export type BookInput = z.infer<typeof bookSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type ProgressInput = z.infer<typeof progressSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookQuery = z.infer<typeof bookQuerySchema>;
