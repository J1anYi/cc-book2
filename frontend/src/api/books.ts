import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export interface Book {
  id: number;
  title: string;
  author: string | null;
  file_path: string;
  file_type: string;
  cover_path: string | null;
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

export async function getBooks(): Promise<Book[]> {
  const response = await api.get('/books');
  return response.data;
}

export async function getBook(id: number): Promise<Book> {
  const response = await api.get(`/books/${id}`);
  return response.data;
}
