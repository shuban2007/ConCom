import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/register', authRateLimit, AuthController.register);
router.post('/login', authRateLimit, AuthController.login);
router.get('/me', requireAuth, AuthController.me);

export default router;
