import sharp from 'sharp';
import path from 'path';

const FORMAT_MAP = {
  jpg: 'jpeg', jpeg: 'jpeg', png: 'png',
  webp: 'webp', bmp: 'bmp', gif: 'gif',
};

/**
 * Converts/compresses an image using Sharp.
 * @param {string} inputPath - absolute path to source file
 * @param {string} tempDir - working directory
 * @param {string} targetFormat - e.g. 'png'
 * @param {string} operation - 'convert' | 'compress' | 'both'
 * @param {string} compressionLevel - 'low' | 'medium' | 'high'
 * @returns {Promise<{outputPath: string, outputSize: number}>}
 */
export const processImage = async (inputPath, tempDir, targetFormat, operation, compressionLevel = 'medium') => {
  const qualityMap = { low: 90, medium: 75, high: 50 };
  const quality = qualityMap[compressionLevel] ?? 75;

  const fmt = FORMAT_MAP[targetFormat] || 'jpeg';
  const outputPath = path.join(tempDir, `output.${targetFormat}`);

  let pipeline = sharp(inputPath);

  if (operation === 'compress' || operation === 'both') {
    pipeline = pipeline[fmt]({ quality });
  } else {
    pipeline = pipeline.toFormat(fmt);
  }

  const info = await pipeline.toFile(outputPath);
  return { outputPath, outputSize: info.size };
};
