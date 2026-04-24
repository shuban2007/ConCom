import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export const AuthController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.register(email, password);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      logger.warn('Registration failed', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      logger.warn('Login failed', { error: err.message });
      res.status(401).json({ success: false, error: err.message });
    }
  },

  me: async (req, res) => {
    res.json({ success: true, data: { id: req.user.id, email: req.user.email, tokens: req.user.tokens } });
  },
};
