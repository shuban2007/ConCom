// Shared constants between frontend and backend logic
export const MAX_CLIENT_SIZE_MB = 100;
export const MAX_SERVER_SIZE_MB = 500;
export const MAX_FILE_SIZE_BYTES = MAX_SERVER_SIZE_MB * 1024 * 1024;
export const INITIAL_TOKENS = 10;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac',
  'application/pdf',
  'text/plain', 'text/html', 'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const CONVERSION_MAP: Record<string, string[]> = {
  'image/jpeg': ['png', 'webp', 'bmp'],
  'image/png': ['jpg', 'webp', 'bmp'],
  'image/webp': ['jpg', 'png'],
  'image/bmp': ['jpg', 'png', 'webp'],
  'image/gif': ['png', 'jpg', 'webp'],
  'video/mp4': ['webm', 'mp3'],
  'video/webm': ['mp4', 'mp3'],
  'video/quicktime': ['mp4', 'webm'],
  'video/x-msvideo': ['mp4', 'webm'],
  'audio/mpeg': ['wav', 'ogg'],
  'audio/wav': ['mp3', 'ogg'],
  'audio/ogg': ['mp3', 'wav'],
  'application/pdf': ['txt'],
  'text/plain': ['pdf', 'docx'],
  'text/html': ['pdf'],
  'text/csv': ['xlsx', 'pdf'],
  'application/json': ['txt', 'csv'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['pdf', 'html', 'txt'],
};

export const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', bmp: 'image/bmp', gif: 'image/gif',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  avi: 'video/x-msvideo', mp3: 'audio/mpeg', wav: 'audio/wav',
  ogg: 'audio/ogg', flac: 'audio/flac',
  pdf: 'application/pdf', txt: 'text/plain', html: 'text/html',
  csv: 'text/csv', json: 'application/json',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
