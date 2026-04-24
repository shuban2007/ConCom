import { UserStoreService } from './store.service.js';
import { logger } from '../utils/logger.js';

export const TokenService = {
  /**
   * Atomically reserves 1 token for a user.
   * Returns true if reservation succeeded, false if insufficient tokens.
   */
  reserve: async (userId) => {
    return UserStoreService.withUserLock(userId, async (users) => {
      const user = users.find((u) => u.id === userId);
      if (!user || user.tokens < 1) {
        return { value: false, updatedUsers: null };
      }
      user.tokens -= 1;
      logger.token(userId, 'reserved', user.tokens);
      return { value: true, updatedUsers: users };
    });
  },

  /**
   * Refunds 1 token to a user (called on full failure).
   */
  refund: async (userId) => {
    return UserStoreService.withUserLock(userId, async (users) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        user.tokens += 1;
        logger.token(userId, 'refunded', user.tokens);
        return { value: user.tokens, updatedUsers: users };
      }
      return { value: null, updatedUsers: null };
    });
  },

  /**
   * Get current token count for a user.
   */
  getCount: async (userId) => {
    const user = await UserStoreService.findById(userId);
    return user ? user.tokens : 0;
  },
};
