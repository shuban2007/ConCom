import rateLimit from 'express-rate-limit';

// Stricter for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient for processing endpoints
export const processRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, error: 'Rate limit exceeded. Max 10 conversions per minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});
