import { DecisionResult, ProcessingMode } from './types';

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
  ogg: 'audio/ogg', pdf: 'application/pdf', txt: 'text/plain',
  html: 'text/html', csv: 'text/csv', json: 'application/json',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const MAX_CLIENT_SIZE_MB = 100;
export const MAX_SERVER_SIZE_MB = 500;

// Conversions that require server-side processing
const SERVER_REQUIRED_CONVERSIONS = new Set([
  'application/pdf->txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document->pdf',
  'video/quicktime->mp4', 'video/x-msvideo->mp4', 'video/x-msvideo->webm',
]);

/**
 * Smart Decision Engine: determines the optimal processing mode for a batch.
 * Returns a unified mode for the ENTIRE batch (not per-file).
 */
export function decideProcessing(
  files: File[],
  targetFormat: string,
  isLoggedIn: boolean,
  tokens: number
): DecisionResult {
  if (files.length === 0) {
    return { mode: 'blocked', confidence: 'high', reason: 'No files selected' };
  }

  const totalMB = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  // Check if any file requires server-side conversion
  const requiresServer = files.some((f) =>
    SERVER_REQUIRED_CONVERSIONS.has(`${f.type}->${targetFormat}`)
  );

  // Check if any file is a video/audio (heavy processing)
  const hasMedia = files.some((f) => f.type.startsWith('video/') || f.type.startsWith('audio/'));

  if (!isLoggedIn) {
    if (requiresServer) {
      return {
        mode: 'blocked',
        confidence: 'high',
        reason: 'Login required — this conversion needs server processing',
      };
    }
    if (totalMB > MAX_CLIENT_SIZE_MB) {
      return {
        mode: 'blocked',
        confidence: 'high',
        reason: `File too large for browser mode (${totalMB.toFixed(0)}MB > ${MAX_CLIENT_SIZE_MB}MB). Login required.`,
      };
    }
    return {
      mode: 'client',
      confidence: 'high',
      reason: 'Processing entirely in your browser — no upload needed',
    };
  }

  // Logged in from here
  if (requiresServer) {
    if (tokens < 1) {
      return { mode: 'blocked', confidence: 'high', reason: 'Insufficient tokens for server processing' };
    }
    return {
      mode: 'server',
      confidence: 'high',
      reason: 'This conversion requires our secure servers (1 token)',
    };
  }

  if (totalMB <= MAX_CLIENT_SIZE_MB && !hasMedia) {
    return {
      mode: 'client',
      confidence: 'high',
      reason: 'Small file — processing in your browser for maximum privacy',
    };
  }

  if (totalMB <= MAX_CLIENT_SIZE_MB && hasMedia) {
    return {
      mode: 'client',
      confidence: 'medium',
      reason: 'Media file processed locally via WebAssembly (may take a moment)',
    };
  }

  if (totalMB <= MAX_SERVER_SIZE_MB && tokens >= 1) {
    return {
      mode: 'server',
      confidence: 'high',
      reason: `Large file (${totalMB.toFixed(0)}MB) — our servers handle this faster (1 token)`,
    };
  }

  return {
    mode: 'blocked',
    confidence: 'high',
    reason: `File too large (${totalMB.toFixed(0)}MB) or insufficient tokens`,
  };
}
