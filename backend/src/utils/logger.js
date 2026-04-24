import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

// Ensure logs directory exists
if (!fs.existsSync(config.logsDir)) {
  fs.mkdirSync(config.logsDir, { recursive: true });
}

const appLogPath = path.join(config.logsDir, 'app.log');
const errorLogPath = path.join(config.logsDir, 'error.log');

const write = (filePath, level, message, meta = {}) => {
  const entry = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }) + '\n';
  fs.appendFile(filePath, entry, () => {}); // non-blocking
  if (process.env.NODE_ENV !== 'test') {
    console[level === 'error' ? 'error' : 'log'](`[${level.toUpperCase()}] ${message}`, Object.keys(meta).length ? meta : '');
  }
};

export const logger = {
  info: (message, meta) => write(appLogPath, 'info', message, meta),
  warn: (message, meta) => write(appLogPath, 'warn', message, meta),
  error: (message, meta) => write(errorLogPath, 'error', message, meta),
  token: (userId, action, tokens) => write(appLogPath, 'token', `Token ${action}`, { userId, tokens }),
};
