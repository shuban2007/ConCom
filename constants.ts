import { SupportedFormat } from './types';

// Map input mime types/extensions to allowed output formats
export const CONVERSION_MAP: Record<string, SupportedFormat[]> = {
  // Images
  'image/jpeg': ['png', 'webp'],
  'image/png': ['jpg', 'webp'],
  'image/webp': ['jpg', 'png'],
  'image/bmp': ['jpg', 'png', 'webp'],
  
  // Documents
  'text/plain': ['pdf', 'docx'],
  'text/html': ['pdf', 'docx'],
  'application/json': ['txt', 'pdf'],
  'application/xml': ['txt', 'pdf'],
  'text/xml': ['txt', 'pdf'],
  'text/csv': ['pdf', 'xlsx'],
  
  // PDF (Special case)
  'application/pdf': ['txt'], // Extract text only
  
  // Word (Requires complex parsing, simplistic approach for demo)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['pdf', 'txt', 'html'],
};

export const MAX_FILE_SIZE_MB = 250;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const EXTENSION_TO_MIME: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'pdf': 'application/pdf',
  'txt': 'text/plain',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'html': 'text/html',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'json': 'application/json',
};
