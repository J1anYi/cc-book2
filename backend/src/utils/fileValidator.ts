const ALLOWED_EXTENSIONS = new Set(['.epub', '.pdf', '.txt']);

export function validateExtension(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.has(ext);
}

export async function validateFileType(buffer: Buffer, expectedExt: string): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
  // EPUB files are ZIP archives, check for PK signature
  if (expectedExt === '.epub') {
    if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
      return { valid: true, detectedType: 'application/epub+zip' };
    }
    return { valid: false, error: 'Not a valid EPUB file' };
  }
  // PDF files start with %PDF
  if (expectedExt === '.pdf') {
    const header = buffer.slice(0, 4).toString('ascii');
    if (header === '%PDF') {
      return { valid: true, detectedType: 'application/pdf' };
    }
    return { valid: false, error: 'Not a valid PDF file' };
  }
  // Text files
  if (expectedExt === '.txt') {
    return { valid: true, detectedType: 'text/plain' };
  }
  return { valid: true };
}
