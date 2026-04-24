import multer from 'multer';
import { ALLOWED_MIME_TYPES } from '../../../shared/constants.js';
import { config } from '../config/index.js';

// Use memory storage — files live only in RAM during request
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeBytes },
  fileFilter,
});

// Error handler for multer-specific errors
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, error: 'File exceeds 500MB limit' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
};
