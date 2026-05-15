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

export interface Series {
  id: number;
  name: string;
  description: string | null;
  book_count: number;
  min_index: number | null;
  max_index: number | null;
  created_at: string;
}

export interface SeriesWithBooks extends Series {
  books: {
    id: number;
    title: string;
    author: string | null;
    series_index: number | null;
  }[];
}

export interface DetectionResult {
  bookId: number;
  title: string;
  detected: {
    seriesName: string;
    index: number;
  } | null;
}

export async function getSeries(): Promise<Series[]> {
  const response = await api.get('/series');
  return response.data;
}

export async function getSeriesById(id: number): Promise<SeriesWithBooks> {
  const response = await api.get(`/series/${id}`);
  return response.data;
}

export async function createSeries(data: {
  name: string;
  description?: string;
}): Promise<Series> {
  const response = await api.post('/series', data);
  return response.data;
}

export async function updateSeries(
  id: number,
  data: { name: string; description?: string }
): Promise<Series> {
  const response = await api.put(`/series/${id}`, data);
  return response.data;
}

export async function deleteSeries(id: number): Promise<void> {
  await api.delete(`/series/${id}`);
}

export async function addBookToSeries(
  seriesId: number,
  bookId: number,
  index?: number
): Promise<{ id: number; series_id: number; series_index: number }> {
  const response = await api.put(`/series/${seriesId}/books/${bookId}`, { index });
  return response.data;
}

export async function removeBookFromSeries(seriesId: number, bookId: number): Promise<void> {
  await api.delete(`/series/${seriesId}/books/${bookId}`);
}

export async function detectSeriesInfo(bookIds: number[]): Promise<DetectionResult[]> {
  const response = await api.post('/series/detect', { bookIds });
  return response.data;
}

export async function reorderSeries(seriesId: number, bookIds: number[]): Promise<{ id: number; series_index: number }[]> {
  const response = await api.post('/series/reorder', { seriesId, bookIds });
  return response.data;
}
