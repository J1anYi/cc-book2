import fs from 'fs';
import path from 'path';

interface Metadata {
  title: string | null;
  author: string | null;
  coverPath?: string | null;
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
  // TODO: Implement full EPUB metadata extraction using epub.js
  // - Extract title from OPF file
  // - Extract author(s) from OPF file
  // - Extract cover image from EPUB container
  // - Use library: npm install epub
  return { title: fileName, author: null, coverPath: null };
}

async function extractPdfMetadata(filePath: string, fileName: string): Promise<Metadata> {
  // TODO: Implement full PDF metadata extraction using pdf-parse
  // - Extract title from PDF info dictionary
  // - Extract author from PDF info dictionary
  // - Extract first page as cover image
  // - Use library: npm install pdf-parse
  return { title: fileName, author: null, coverPath: null };
}
