import { CompressionLevel, COMPRESSION_SETTINGS, ConvertedFile } from '../types';
import { EXTENSION_TO_MIME } from '../constants';

// Mocking libraries for the sake of the environment constraint.
// In a real app, these would be:
// import { jsPDF } from 'jspdf';
// import { Document, Packer, Paragraph } from 'docx';
// import * as XLSX from 'xlsx';

// Helper to simulate delay for realistic UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processFile = async (
  item: ConvertedFile, 
  compressionLevel: CompressionLevel
): Promise<{ blob: Blob, size: number }> => {
  
  await delay(800); // UI feel

  const { file, targetFormat, originalType } = item;
  
  // IMAGE CONVERSION
  if (originalType.startsWith('image/')) {
    return processImage(file, targetFormat, compressionLevel);
  }

  // TEXT BASED CONVERSIONS
  if (originalType === 'text/plain' || originalType === 'application/json' || originalType.includes('xml') || originalType === 'text/csv') {
    const textContent = await file.text();
    
    if (targetFormat === 'pdf') {
      return generatePdfFromText(textContent);
    }
    if (targetFormat === 'docx') {
      // Mock DOCX generation (create a simple HTML-compatible blob that Word can open, or simple text)
      // Real implementation would use 'docx' library
      return { blob: new Blob([textContent], { type: EXTENSION_TO_MIME['docx'] }), size: textContent.length };
    }
    if (targetFormat === 'xlsx' && originalType === 'text/csv') {
       // Mock XLSX - In reality use XLSX.utils.json_to_sheet
       return { blob: new Blob([textContent], { type: EXTENSION_TO_MIME['xlsx'] }), size: textContent.length };
    }
    // Fallback: simple format change
    return { blob: new Blob([textContent], { type: EXTENSION_TO_MIME[targetFormat] || 'text/plain' }), size: textContent.length };
  }

  // PDF to TEXT
  if (originalType === 'application/pdf' && targetFormat === 'txt') {
     // Mock PDF Text Extraction
     return { blob: new Blob(["[Extracted Text from PDF placeholder]"], { type: 'text/plain' }), size: 30 };
  }

  throw new Error(`Conversion from ${originalType} to ${targetFormat} not fully implemented in this demo.`);
};

const processImage = async (file: File, targetFormat: string, level: CompressionLevel): Promise<{ blob: Blob, size: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0);

        const quality = COMPRESSION_SETTINGS[level].imageQuality;
        const mimeType = EXTENSION_TO_MIME[targetFormat] || 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, size: blob.size });
            } else {
              reject(new Error('Image conversion failed'));
            }
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const generatePdfFromText = async (text: string): Promise<{ blob: Blob, size: number }> => {
  // In a real app:
  // const doc = new jsPDF();
  // doc.text(text, 10, 10);
  // const blob = doc.output('blob');
  
  // Mock PDF blob for demo
  const mockPdfContent = `%PDF-1.5\n%µµµµ\n1 0 obj\n<<...>>\nstream\n${text.substring(0, 100)}\nendstream\nendobj\n%%EOF`;
  const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
  return { blob, size: blob.size };
};
