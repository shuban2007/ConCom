import { TokenService } from '../services/token.service.js';
import { processSingleFile } from '../services/processing.service.js';
import { EXTENSION_TO_MIME } from '../../../shared/constants.js';
import { logger } from '../utils/logger.js';

export const ProcessController = {
  process: async (req, res) => {
    const userId = req.user.id;
    const { targetFormat, operation = 'convert', compressionLevel = 'medium' } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }
    if (!targetFormat) {
      return res.status(400).json({ success: false, error: 'targetFormat is required' });
    }

    // Reserve token atomically
    const reserved = await TokenService.reserve(userId);
    if (!reserved) {
      return res.status(402).json({ success: false, error: 'Insufficient tokens' });
    }

    let atLeastOneSuccess = false;
    const results = [];

    try {
      for (const file of files) {
        try {
          const result = await processSingleFile(file, targetFormat, operation, compressionLevel);
          const mimeType = EXTENSION_TO_MIME[targetFormat] || 'application/octet-stream';
          const b64 = result.outputBuffer.toString('base64');
          results.push({
            fileName: file.originalname.replace(/\.[^.]+$/, `.${targetFormat}`),
            originalSize: result.originalSize,
            outputSize: result.outputSize,
            mimeType,
            data: b64,
            success: true,
          });
          atLeastOneSuccess = true;
        } catch (fileErr) {
          logger.error('File processing failed', { file: file.originalname, error: fileErr.message });
          results.push({ fileName: file.originalname, success: false, error: fileErr.message });
        }
      }
    } finally {
      // If EVERY file failed → refund the token
      if (!atLeastOneSuccess) {
        await TokenService.refund(userId);
        logger.token(userId, 'refunded (all failed)', await TokenService.getCount(userId));
      }
    }

    const tokensRemaining = await TokenService.getCount(userId);
    const tokenUsed = atLeastOneSuccess;

    logger.info('Processing complete', { userId, files: files.length, success: atLeastOneSuccess });

    res.json({
      success: true,
      data: { results, tokenUsed, tokenRefunded: !atLeastOneSuccess },
      tokensRemaining,
    });
  },
};
