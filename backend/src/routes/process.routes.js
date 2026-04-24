import { Router } from 'express';
import { ProcessController } from '../controllers/process.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { upload, multerErrorHandler } from '../middlewares/upload.middleware.js';
import { processRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  processRateLimit,
  upload.array('files', 20),
  multerErrorHandler,
  ProcessController.process
);

export default router;
