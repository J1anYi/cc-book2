import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Book {
  id: number;
  title: string;
  author: string | null;
  file_path: string;
  file_type: string;
  cover_path: string | null;
  category: string | null;
  tags: string | null;
  reading_status: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export async function uploadBook(file: File): Promise<Book> {
  const formData = new FormData();
  formData.append('book', file);

  const response = await api.post('/books', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}

export async function getBooks(
  search?: string,
  collectionId?: number,
  status?: string,
  tags?: string,
  tagMode?: 'AND' | 'OR'
): Promise<Book[]> {
  const params: any = {};
  if (search) params.search = search;
  if (collectionId) params.collection_id = collectionId;
  if (status) params.status = status;
  if (tags) params.tags = tags;
  if (tagMode) params.tagMode = tagMode;
  const response = await api.get('/books', { params });
  return response.data.data || response.data;
}

export async function getBook(id: number): Promise<Book> {
  const response = await api.get(`/books/${id}`);
  return response.data;
}

export async function deleteBook(id: number): Promise<void> {
  await api.delete(`/books/${id}`);
}

export async function updateBook(id: number, data: { category?: string; tags?: string }): Promise<Book> {
  const response = await api.patch(`/books/${id}`, data);
  return response.data;
}

export async function updateReadingStatus(
  id: number,
  status: 'want_to_read' | 'reading' | 'read'
): Promise<Book> {
  const response = await api.put(`/books/${id}/status`, { status });
  return response.data;
}

export async function login(password: string): Promise<{ success: boolean; token?: string }> {
  const response = await api.post('/admin/login', { password });
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/admin/logout');
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/categories');
  return response.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await api.post('/categories', { name });
  return response.data;
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const response = await api.put(`/categories/${id}`, { name });
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
