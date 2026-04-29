import fs from 'fs';
import path from 'path';

interface Metadata {
  title: string | null;
  author: string | null;
}

export async function extractMetadata(filePath: string, fileType: string): Promise<Metadata> {
  const fileName = path.basename(filePath, path.extname(filePath));

  switch (fileType) {
    case 'epub':
      return extractEpubMetadata(filePath, fileName);
    case 'pdf':
      return extractPdfMetadata(filePath, fileName);
    case 'txt':
      return { title: fileName, author: null };
    default:
      return { title: fileName, author: null };
  }
}

async function extractEpubMetadata(filePath: string, fileName: string): Promise<Metadata> {
  // Simplified EPUB metadata extraction
  return { title: fileName, author: null };
}

async function extractPdfMetadata(filePath: string, fileName: string): Promise<Metadata> {
  // Simplified PDF metadata extraction
  return { title: fileName, author: null };
}
