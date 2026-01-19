export enum FileStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export enum CompressionLevel {
  LOW = 'LOW',     // High quality, low compression
  MEDIUM = 'MEDIUM', // Balanced
  HIGH = 'HIGH',    // Low quality, high compression
}

export interface ConvertedFile {
  id: string;
  originalName: string;
  originalSize: number;
  originalType: string;
  file: File;
  targetFormat: string;
  status: FileStatus;
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  errorMessage?: string;
}

export type SupportedFormat = 
  | 'jpg' | 'png' | 'webp' | 'bmp' 
  | 'pdf' | 'txt' | 'docx' | 'html' 
  | 'xlsx' | 'json';

export const COMPRESSION_SETTINGS = {
  [CompressionLevel.LOW]: { imageQuality: 0.9, label: 'Best Quality' },
  [CompressionLevel.MEDIUM]: { imageQuality: 0.7, label: 'Balanced' },
  [CompressionLevel.HIGH]: { imageQuality: 0.5, label: 'Max Compression' },
};
