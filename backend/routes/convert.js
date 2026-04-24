import express from 'express';
import multer from 'multer';
import { convertDocxToPdf } from '../services/libreOfficeService.js';

const router = express.Router();
// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 250 * 1024 * 1024 } });

router.post('/docx-to-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const pdfBuffer = await convertDocxToPdf(req.file.buffer);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname.replace('.docx', '.pdf')}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server-side conversion failed', details: error.message });
  }
});

export default router;
