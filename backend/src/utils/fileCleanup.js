import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Recursively deletes a temporary directory.
 * Safe to call even if directory doesn't exist.
 */
export const cleanupTempDir = async (dirPath) => {
  try {
    await fs.promises.rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    logger.error('Failed to cleanup temp dir', { dirPath, error: err.message });
  }
};

/**
 * Creates a unique temp directory for a single request.
 * Returns the path.
 */
export const createTempDir = async () => {
  const dirPath = path.join(config.tempDir, `job-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.promises.mkdir(dirPath, { recursive: true });
  return dirPath;
};

/**
 * Wraps an async handler with guaranteed cleanup of a tempDir.
 * Usage: withCleanup(tempDir, async () => { ... })
 */
export const withCleanup = async (tempDir, fn) => {
  try {
    return await fn();
  } finally {
    await cleanupTempDir(tempDir);
  }
};
