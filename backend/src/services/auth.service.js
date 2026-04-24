import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserStoreService } from './store.service.js';
import { config } from '../config/index.js';
import { INITIAL_TOKENS } from '../../../shared/constants.js';
import { logger } from '../utils/logger.js';

const SALT_ROUNDS = 10;

export const AuthService = {
  register: async (email, password) => {
    if (!email || !password || password.length < 6) {
      throw new Error('Valid email and password (min 6 chars) required');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      id: uuidv4(),
      email: email.toLowerCase().trim(),
      passwordHash,
      tokens: INITIAL_TOKENS,
      createdAt: new Date().toISOString(),
    };

    await UserStoreService.createUser(user);
    logger.info('User registered', { email: user.email });

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return { token, user: { id: user.id, email: user.email, tokens: user.tokens } };
  },

  login: async (email, password) => {
    const user = await UserStoreService.findByEmail(email.toLowerCase().trim());
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    logger.info('User logged in', { email: user.email });
    return { token, user: { id: user.id, email: user.email, tokens: user.tokens } };
  },

  verifyToken: (token) => {
    return jwt.verify(token, config.jwtSecret);
  },
};
