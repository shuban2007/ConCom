import { CompressionLevel, ConvertedFile, FileStatus, OperationType } from '../types';
import { EXTENSION_TO_MIME } from '../constants';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Lazy FFmpeg singleton
let _ffmpeg: FFmpeg | null = null;
const getFFmpeg = async () => {
  if (_ffmpeg) return _ffmpeg;
  _ffmpeg = new FFmpeg();
  await _ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
  });
  return _ffmpeg;
};

const COMPRESSION_QUALITY: Record<CompressionLevel, number> = {
  low: 0.9, medium: 0.7, high: 0.45,
};

// ── Image (Canvas) ──────────────────────────────────────────────────────────
const processImageClient = (
  file: File, targetFormat: string, compressionLevel: CompressionLevel
): Promise<{ blob: Blob; size: number }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const mime = EXTENSION_TO_MIME[targetFormat] || 'image/jpeg';
        canvas.toBlob(
          (blob) => blob ? resolve({ blob, size: blob.size }) : reject(new Error('Canvas conversion failed')),
          mime,
          COMPRESSION_QUALITY[compressionLevel]
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

// ── Media (FFmpeg WASM) ─────────────────────────────────────────────────────
const processMediaClient = async (
  file: File, targetFormat: string
): Promise<{ blob: Blob; size: number }> => {
  const ffmpeg = await getFFmpeg();
  const inputName = `in_${Date.now()}.${file.name.split('.').pop()}`;
  const outputName = `out_${Date.now()}.${targetFormat}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-y', outputName]);
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: EXTENSION_TO_MIME[targetFormat] || 'application/octet-stream' });
  return { blob, size: blob.size };
};

// ── PDF → Text ──────────────────────────────────────────────────────────────
const processPdfToText = async (file: File): Promise<{ blob: Blob; size: number }> => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  const blob = new Blob([text], { type: 'text/plain' });
  return { blob, size: blob.size };
};

// ── Text → PDF ─────────────────────────────────────────────────────────────
const processTextToPdf = async (file: File): Promise<{ blob: Blob; size: number }> => {
  const text = await file.text();
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 10);
  const blob = doc.output('blob');
  return { blob, size: blob.size };
};

// ── Text → DOCX ────────────────────────────────────────────────────────────
const processTextToDocx = async (file: File): Promise<{ blob: Blob; size: number }> => {
  const text = await file.text();
  const doc = new Document({
    sections: [{ children: [new Paragraph({ children: [new TextRun(text)] })] }],
  });
  const blob = await Packer.toBlob(doc);
  return { blob, size: blob.size };
};

// ── CSV → XLSX ─────────────────────────────────────────────────────────────
const processCsvToXlsx = async (file: File): Promise<{ blob: Blob; size: number }> => {
  const text = await file.text();
  const ws = XLSX.utils.csv_to_sheet(text);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buf], { type: EXTENSION_TO_MIME['xlsx'] });
  return { blob, size: blob.size };
};

// ── DOCX → HTML / TXT ─────────────────────────────────────────────────────
const processDocxClient = async (
  file: File, targetFormat: 'html' | 'txt'
): Promise<{ blob: Blob; size: number }> => {
  const buf = await file.arrayBuffer();
  const result = targetFormat === 'html'
    ? await mammoth.convertToHtml({ arrayBuffer: buf })
    : await mammoth.extractRawText({ arrayBuffer: buf });
  const blob = new Blob([result.value], { type: EXTENSION_TO_MIME[targetFormat] });
  return { blob, size: blob.size };
};

// ── Server-side route ──────────────────────────────────────────────────────
export const processViaServer = async (
  files: File[],
  targetFormat: string,
  operation: OperationType,
  compressionLevel: CompressionLevel,
  token: string
): Promise<{ results: any[]; tokenUsed: boolean; tokenRefunded: boolean; tokensRemaining: number }> => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('targetFormat', targetFormat);
  formData.append('operation', operation);
  formData.append('compressionLevel', compressionLevel);

  const res = await fetch('/api/process', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Server processing failed');
  return { ...json.data, tokensRemaining: json.tokensRemaining };
};

// ── Main dispatch ─────────────────────────────────────────────────────────
export const processFileClient = async (
  file: ConvertedFile,
  targetFormat: string,
  operation: OperationType,
  compressionLevel: CompressionLevel
): Promise<{ blob: Blob; size: number }> => {
  const { originalType } = file;
  const f = file.file;

  if (originalType.startsWith('image/')) return processImageClient(f, targetFormat, compressionLevel);
  if (originalType.startsWith('video/') || originalType.startsWith('audio/')) return processMediaClient(f, targetFormat);
  if (originalType === 'application/pdf' && targetFormat === 'txt') return processPdfToText(f);
  if (originalType === 'text/plain' && targetFormat === 'pdf') return processTextToPdf(f);
  if (originalType === 'text/plain' && targetFormat === 'docx') return processTextToDocx(f);
  if (originalType === 'text/csv' && targetFormat === 'xlsx') return processCsvToXlsx(f);
  if (
    originalType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
    (targetFormat === 'html' || targetFormat === 'txt')
  ) return processDocxClient(f, targetFormat as 'html' | 'txt');

  // Fallback: treat as text
  const text = await f.text();
  const blob = new Blob([text], { type: EXTENSION_TO_MIME[targetFormat] || 'text/plain' });
  return { blob, size: blob.size };
};
