import { spawn } from 'child_process';
import path from 'path';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Converts a media file using FFmpeg with timeout protection.
 * @param {string} inputPath - absolute path to source file
 * @param {string} tempDir - working directory
 * @param {string} targetFormat - e.g. 'webm', 'mp3'
 * @param {string} operation - 'convert' | 'compress' | 'both'
 * @param {string} compressionLevel - 'low' | 'medium' | 'high'
 * @returns {Promise<{outputPath: string, outputSize: number}>}
 */
export const processMedia = (inputPath, tempDir, targetFormat, operation, compressionLevel = 'medium') => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(tempDir, `output.${targetFormat}`);

    const bitrateMap = { low: '2M', medium: '1M', high: '500k' };
    const audioBitrateMap = { low: '192k', medium: '128k', high: '64k' };
    const bitrate = bitrateMap[compressionLevel] ?? '1M';
    const audioBitrate = audioBitrateMap[compressionLevel] ?? '128k';

    const args = ['-i', inputPath, '-y'];

    const isAudio = ['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(targetFormat);
    if (isAudio) {
      args.push('-vn', '-b:a', audioBitrate);
    } else if (operation !== 'convert') {
      args.push('-b:v', bitrate, '-b:a', audioBitrate);
    }

    args.push(outputPath);

    const ffmpeg = spawn('ffmpeg', args);
    let stderr = '';
    ffmpeg.stderr.on('data', (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      ffmpeg.kill('SIGKILL');
      reject(new Error('FFmpeg conversion timed out'));
    }, config.ffmpegTimeoutMs);

    ffmpeg.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        logger.error('FFmpeg failed', { code, stderr: stderr.slice(-500) });
        return reject(new Error('FFmpeg conversion failed'));
      }
      import('fs').then(({ promises: fsp }) =>
        fsp.stat(outputPath).then((s) => resolve({ outputPath, outputSize: s.size }))
      );
    });

    ffmpeg.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
};
