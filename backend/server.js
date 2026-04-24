import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { config } from './src/config/index.js';
import { logger } from './src/utils/logger.js';
import authRoutes from './src/routes/auth.routes.js';
import processRoutes from './src/routes/process.routes.js';

// Ensure required directories exist on startup
[config.tempDir, config.logsDir].forEach((dir) => {
  fs.mkdirSync(dir.replace(/^\/([A-Z]:)/, '$1'), { recursive: true });
});

// Ensure users.json exists
const usersPath = config.usersFilePath;
if (!fs.existsSync(usersPath)) {
  fs.mkdirSync(new URL('../data', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'), { recursive: true });
  fs.writeFileSync(usersPath, '[]', 'utf-8');
}

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/process', processRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack?.slice(0, 300) });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`ConCom backend listening on http://localhost:${PORT}`);
});
