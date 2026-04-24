import { AuthService } from '../services/auth.service.js';
import { UserStoreService } from '../services/store.service.js';
import { logger } from '../utils/logger.js';

/**
 * JWT authentication middleware.
 * Attaches full user object to req.user.
 * Returns 403 if token is missing or invalid.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ success: false, error: 'Authentication required' });
  }

  try {
    const payload = AuthService.verifyToken(token);
    const user = await UserStoreService.findById(payload.id);
    if (!user) {
      return res.status(403).json({ success: false, error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    logger.warn('JWT verification failed', { error: err.message });
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};
