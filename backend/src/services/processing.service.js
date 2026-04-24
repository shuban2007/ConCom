import path from 'path';
import fs from 'fs';
import { processImage } from './processors/image.processor.js';
import { processMedia } from './processors/media.processor.js';
import { processDocxToPdf, processPdfToText, processDocxToText } from './processors/document.processor.js';
import { createTempDir, withCleanup } from '../utils/fileCleanup.js';
import { logger } from '../utils/logger.js';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * Routes a single file to the appropriate processor strategy.
 * Returns { outputPath, outputSize } on success.
 */
const routeToProcessor = async (inputPath, mimeType, targetFormat, operation, compressionLevel, tempDir) => {
  if (mimeType.startsWith('image/')) {
    return processImage(inputPath, tempDir, targetFormat, operation, compressionLevel);
  }
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
    return processMedia(inputPath, tempDir, targetFormat, operation, compressionLevel);
  }
  if (mimeType === 'application/pdf' && targetFormat === 'txt') {
    return processPdfToText(inputPath, tempDir);
  }
  if ((mimeType === DOCX_MIME || mimeType === 'text/plain' || mimeType === 'text/html' || mimeType === 'text/csv') && targetFormat === 'pdf') {
    return processDocxToPdf(inputPath, tempDir);
  }
  if (mimeType === DOCX_MIME && (targetFormat === 'html' || targetFormat === 'txt')) {
    return processDocxToText(inputPath, tempDir, targetFormat);
  }
  throw new Error(`No processor available for ${mimeType} → ${targetFormat}`);
};

/**
 * Processes a single uploaded file.
 * Returns a result object with success, outputPath, sizes.
 */
export const processSingleFile = async (file, targetFormat, operation, compressionLevel) => {
  const tempDir = await createTempDir();
  return withCleanup(tempDir, async () => {
    // Write multer memory buffer to temp dir
    const inputPath = path.join(tempDir, `input_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
    await fs.promises.writeFile(inputPath, file.buffer);

    const { outputPath, outputSize } = await routeToProcessor(
      inputPath,
      file.mimetype,
      targetFormat,
      operation,
      compressionLevel,
      tempDir
    );

    // Read output into memory to return (file will be cleaned up by withCleanup)
    const outputBuffer = await fs.promises.readFile(outputPath);
    return { success: true, outputBuffer, outputSize, originalSize: file.size };
  });
};
