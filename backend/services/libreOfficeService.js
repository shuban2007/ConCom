import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import libre from 'libreoffice-convert';

// Promisify libre.convert for easier async/await usage
const convertAsync = promisify(libre.convert);

export const convertDocxToPdf = async (fileBuffer) => {
  // Convert using LibreOffice. '.pdf' is the desired output extension.
  // Make sure LibreOffice is installed and accessible in the system PATH.
  try {
    const pdfBuffer = await convertAsync(fileBuffer, '.pdf', undefined);
    return pdfBuffer;
  } catch (error) {
    console.error('Error during LibreOffice conversion:', error);
    throw new Error('Failed to convert DOCX to PDF server-side');
  }
};
