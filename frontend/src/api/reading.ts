import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export interface ReadingProgress {
  id: number;
  book_id: number;
  current_page: number;
  current_chapter: string | null;
  progress_percent: number;
  last_read_at: string;
}

export interface Bookmark {
  id: number;
  book_id: number;
  page_number: number | null;
  chapter: string | null;
  position: string | null;
  note: string | null;
  created_at: string;
}

export interface Note {
  id: number;
  book_id: number;
  page_number: number | null;
  chapter: string | null;
  position: string | null;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export async function getProgress(bookId: number): Promise<ReadingProgress | null> {
  const response = await api.get(`/reading/progress/${bookId}`);
  return response.data;
}

export async function saveProgress(data: {
  book_id: number;
  current_page: number;
  current_chapter?: string;
  progress_percent: number;
}): Promise<void> {
  await api.post('/reading/progress', data);
}

export async function getReadingHistory(): Promise<(ReadingProgress & { title: string; author: string | null; file_type: string })[]> {
  const response = await api.get('/reading/history');
  return response.data;
}

export async function getBookmarks(bookId: number): Promise<Bookmark[]> {
  const response = await api.get(`/reading/bookmarks/${bookId}`);
  return response.data;
}

export async function addBookmark(data: {
  book_id: number;
  page_number?: number;
  chapter?: string;
  position?: string;
  note?: string;
}): Promise<Bookmark> {
  const response = await api.post('/reading/bookmarks', data);
  return response.data;
}

export async function deleteBookmark(id: number): Promise<void> {
  await api.delete(`/reading/bookmarks/${id}`);
}

export async function getNotes(bookId: number): Promise<Note[]> {
  const response = await api.get(`/reading/notes/${bookId}`);
  return response.data;
}

export async function addNote(data: {
  book_id: number;
  page_number?: number;
  chapter?: string;
  position?: string;
  content: string;
  color?: string;
}): Promise<Note> {
  const response = await api.post('/reading/notes', data);
  return response.data;
}

export async function updateNote(id: number, data: { content: string; color?: string }): Promise<Note> {
  const response = await api.put(`/reading/notes/${id}`, data);
  return response.data;
}

export async function deleteNote(id: number): Promise<void> {
  await api.delete(`/reading/notes/${id}`);
}

export function getFileUrl(bookId: number): string {
  return `/api/files/${bookId}`;
}
