import fs from 'fs/promises';
import path from 'path';
import * as pdfParse from 'pdf-parse';

interface Metadata {
  title: string | null;
  author: string | null;
  coverPath?: string | null;
}

export async function extractMetadata(filePath: string, fileType: string): Promise<Metadata> {
  const fileName = path.basename(filePath, path.extname(filePath));

  try {
    switch (fileType) {
      case 'epub':
        return await extractEpubMetadata(filePath, fileName);
      case 'pdf':
        return await extractPdfMetadata(filePath, fileName);
      case 'txt':
        return { title: fileName, author: null };
      default:
        return { title: fileName, author: null };
    }
  } catch (error) {
    console.error(`Metadata extraction failed for ${filePath}:`, error);
    return { title: fileName, author: null };
  }
}

async function extractEpubMetadata(filePath: string, fileName: string): Promise<Metadata> {
  return new Promise((resolve) => {
    try {
      // Dynamic import to avoid TypeScript issues with epub library
      // @ts-ignore
      const EPub = require('epub');
      const epub = new EPub(filePath);
      
      epub.on('end', function(this: any) {
        const metadata = this.metadata || {};
        resolve({
          title: metadata.title || fileName,
          author: metadata.creator || null,
          coverPath: null
        });
      });
      
      epub.on('error', (err: Error) => {
        console.error('EPUB parsing error:', err);
        resolve({ title: fileName, author: null });
      });
      
      epub.parse();
    } catch (error) {
      console.error('EPUB initialization error:', error);
      resolve({ title: fileName, author: null });
    }
  });
}

async function extractPdfMetadata(filePath: string, fileName: string): Promise<Metadata> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await (pdfParse as any).default(dataBuffer);
    
    const info = data.info || {};
    return {
      title: info.Title || fileName,
      author: info.Author || null,
      coverPath: null
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return { title: fileName, author: null };
  }
}
