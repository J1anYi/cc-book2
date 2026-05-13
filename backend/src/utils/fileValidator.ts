import { fileTypeFromBuffer } from 'file-type';

// Allowed file types with their magic numbers
const ALLOWED_TYPES: Record<string, string[]> = {
  'application/epub+zip': ['.epub'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
};

const ALLOWED_MIME_TYPES = new Set([
  'application/epub+zip',
  'application/pdf',
  'text/plain',
]);

const ALLOWED_EXTENSIONS = new Set(['.epub', '.pdf', '.txt']);

export function validateExtension(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.has(ext);
}

export async function validateFileType(buffer: Buffer, expectedExt: string): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
  try {
    // For text files, file-type detection often fails (no magic number)
    if (expectedExt === '.txt') {
      // Check if it's a text file by trying to decode as UTF-8
      try {
        const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 1000));
        // Basic check for text content (no null bytes typically)
        if (!content.includes('\x00')) {
          return { valid: true, detectedType: 'text/plain' };
        }
      } catch {
        return { valid: false, error: 'Invalid text file encoding' };
      }
    }

    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      // file-type couldn't detect, but extension is valid
      // For EPUB (which is a ZIP), we need special handling
      if (expectedExt === '.epub' && buffer.length > 4) {
        // EPUB files start with PK (ZIP signature)
        if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
          return { valid: true, detectedType: 'application/epub+zip' };
        }
      }
      return { valid: false, error: 'Could not determine file type' };
    }

    // Map detected MIME types
    const detectedMime = fileType.mime;
    
    // PDF detection
    if (expectedExt === '.pdf' && detectedMime === 'application/pdf') {
      return { valid: true, detectedType: detectedMime };
    }

    // EPUB is a ZIP file, check extension
    if (expectedExt === '.epub' && detectedMime === 'application/zip') {
      return { valid: true, detectedType: 'application/epub+zip' };
    }

    return { 
      valid: false, 
      error: `File type mismatch: expected ${expectedExt}, detected ${detectedMime}` 
    };
  } catch (error) {
    return { valid: false, error: 'File type validation failed' };
  }
}

export function getExtensionFromMime(mime: string): string | null {
  for (const [mimeType, extensions] of Object.entries(ALLOWED_TYPES)) {
    if (mimeType === mime) {
      return extensions[0];
    }
  }
  return null;
}
