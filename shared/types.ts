export type ProcessingMode = 'client' | 'server' | 'blocked';
export type OperationType = 'convert' | 'compress' | 'both';
export type CompressionLevel = 'low' | 'medium' | 'high';

export interface DecisionResult {
  mode: ProcessingMode;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  tokens: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  email: string;
  tokens: number;
}

export interface ProcessRequest {
  targetFormat: string;
  operation: OperationType;
  compressionLevel?: CompressionLevel;
}

export interface ProcessResult {
  fileName: string;
  originalSize: number;
  outputSize: number;
  downloadUrl?: string;
  error?: string;
  success: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokensRemaining?: number;
}
