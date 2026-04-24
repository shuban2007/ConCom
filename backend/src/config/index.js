import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../../');

export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'concom-dev-secret-change-in-production',
  jwtExpiresIn: '15m',
  refreshExpiresIn: '7d',
  usersFilePath: path.join(backendRoot, 'data', 'users.json'),
  tempDir: path.join(backendRoot, 'temp'),
  logsDir: path.join(backendRoot, 'logs'),
  maxFileSizeBytes: 500 * 1024 * 1024,
  ffmpegTimeoutMs: 120_000,
  libreOfficeTimeoutMs: 60_000,
};

