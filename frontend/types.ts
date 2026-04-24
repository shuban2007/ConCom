export enum FileStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type SupportedFormat =
  | 'jpg' | 'png' | 'webp' | 'bmp' | 'gif'
  | 'mp4' | 'webm' | 'mp3' | 'wav' | 'ogg'
  | 'pdf' | 'txt' | 'docx' | 'html'
  | 'xlsx' | 'csv' | 'json';

export type OperationType = 'convert' | 'compress' | 'both';
export type CompressionLevel = 'low' | 'medium' | 'high';
export type ProcessingMode = 'client' | 'server' | 'blocked';

export interface ConvertedFile {
  id: string;
  originalName: string;
  originalSize: number;
  originalType: string;
  file: File;
  status: FileStatus;
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  errorMessage?: string;
}

export interface DecisionResult {
  mode: ProcessingMode;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
}

export interface AuthUser {
  id: string;
  email: string;
  tokens: number;
}
