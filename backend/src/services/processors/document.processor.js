import { promisify } from 'util';
import libre from 'libreoffice-convert';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs';
import path from 'path';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

const libreConvert = promisify(libre.convert);

/**
 * Converts DOCX -> PDF using LibreOffice with timeout.
 */
export const processDocxToPdf = async (inputPath, tempDir) => {
  const buffer = await fs.promises.readFile(inputPath);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('LibreOffice conversion timed out')), config.libreOfficeTimeoutMs)
  );

  const conversionPromise = libreConvert(buffer, '.pdf', undefined);
  const pdfBuffer = await Promise.race([conversionPromise, timeoutPromise]);

  const outputPath = path.join(tempDir, 'output.pdf');
  await fs.promises.writeFile(outputPath, pdfBuffer);
  return { outputPath, outputSize: pdfBuffer.length };
};

/**
 * Extracts raw text from a PDF file using pdf-parse.
 */
export const processPdfToText = async (inputPath, tempDir) => {
  const buffer = await fs.promises.readFile(inputPath);
  const data = await pdfParse(buffer);
  const outputPath = path.join(tempDir, 'output.txt');
  await fs.promises.writeFile(outputPath, data.text, 'utf-8');
  return { outputPath, outputSize: Buffer.byteLength(data.text, 'utf-8') };
};

/**
 * Converts DOCX -> HTML/TXT using LibreOffice.
 */
export const processDocxToText = async (inputPath, tempDir, targetFormat) => {
  const buffer = await fs.promises.readFile(inputPath);
  const ext = targetFormat === 'html' ? '.html' : '.txt';

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('LibreOffice conversion timed out')), config.libreOfficeTimeoutMs)
  );

  const conversionPromise = libreConvert(buffer, ext, undefined);
  const resultBuffer = await Promise.race([conversionPromise, timeoutPromise]);

  const outputPath = path.join(tempDir, `output${ext}`);
  await fs.promises.writeFile(outputPath, resultBuffer);
  return { outputPath, outputSize: resultBuffer.length };
};
