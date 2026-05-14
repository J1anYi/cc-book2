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

export interface Collection {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  book_count: number;
  created_at: string;
}

export async function getCollections(): Promise<Collection[]> {
  const response = await api.get('/collections');
  return response.data;
}

export async function createCollection(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Collection> {
  const response = await api.post('/collections', data);
  return response.data;
}

export async function updateCollection(
  id: number,
  data: { name: string; description?: string; icon?: string; color?: string }
): Promise<Collection> {
  const response = await api.put(`/collections/${id}`, data);
  return response.data;
}

export async function deleteCollection(id: number): Promise<void> {
  await api.delete(`/collections/${id}`);
}

export async function addBookToCollection(collectionId: number, bookId: number): Promise<void> {
  await api.post(`/collections/${collectionId}/books/${bookId}`);
}

export async function removeBookFromCollection(collectionId: number, bookId: number): Promise<void> {
  await api.delete(`/collections/${collectionId}/books/${bookId}`);
}

export async function getBookCollections(bookId: number): Promise<number[]> {
  const response = await api.get(`/collections/book/${bookId}`);
  return response.data;
}
