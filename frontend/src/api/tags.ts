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

export interface Tag {
  id: number;
  name: string;
  color: string | null;
  usage_count: number;
  created_at: string;
}

export async function getTags(): Promise<Tag[]> {
  const response = await api.get('/tags');
  return response.data.data || response.data;
}

export async function createTag(data: { name: string; color?: string }): Promise<Tag> {
  const response = await api.post('/tags', data);
  return response.data;
}

export async function updateTag(id: number, data: { name: string; color?: string }): Promise<Tag> {
  const response = await api.put(`/tags/${id}`, data);
  return response.data;
}

export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/tags/${id}`);
}

export async function getBookTags(bookId: number): Promise<Tag[]> {
  const response = await api.get(`/tags/book/${bookId}`);
  return response.data.data || response.data;
}

export async function setBookTags(bookId: number, tagIds: number[]): Promise<Tag[]> {
  const response = await api.post(`/tags/books/${bookId}`, { tagIds });
  return response.data;
}
