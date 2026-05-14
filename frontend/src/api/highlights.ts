const API_BASE = '/api';

export interface Highlight {
  id: number;
  book_id: number;
  cfi_range: string;
  selected_text: string;
  color: string;
  note: string | null;
  chapter: string | null;
  created_at: string;
}

export async function getHighlights(bookId: number): Promise<Highlight[]> {
  const response = await fetch(`${API_BASE}/highlights/${bookId}`);
  return response.json();
}

export async function addHighlight(data: {
  book_id: number;
  cfi_range: string;
  selected_text: string;
  color: string;
  note?: string;
  chapter?: string;
}): Promise<Highlight> {
  const response = await fetch(`${API_BASE}/highlights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateHighlight(id: number, data: { color?: string; note?: string }): Promise<Highlight> {
  const response = await fetch(`${API_BASE}/highlights/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function deleteHighlight(id: number): Promise<void> {
  await fetch(`${API_BASE}/highlights/${id}`, { method: 'DELETE' });
}
