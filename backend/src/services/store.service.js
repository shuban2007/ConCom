import fs from 'fs';
import { Mutex } from 'async-mutex';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// In-memory mutex registry — one mutex per userId
const mutexMap = new Map();

const getMutex = (userId) => {
  if (!mutexMap.has(userId)) {
    mutexMap.set(userId, new Mutex());
  }
  return mutexMap.get(userId);
};

const readStore = async () => {
  try {
    const raw = await fs.promises.readFile(config.usersFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeStore = async (users) => {
  await fs.promises.writeFile(config.usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
};

export const UserStoreService = {
  /**
   * Execute any read/write operation on a specific user atomically.
   * The callback receives the full users array and must return it (even if unchanged).
   */
  withUserLock: async (userId, fn) => {
    const mutex = getMutex(userId);
    return mutex.runExclusive(async () => {
      const users = await readStore();
      const result = await fn(users);
      if (result.updatedUsers) {
        await writeStore(result.updatedUsers);
      }
      return result.value;
    });
  },

  findByEmail: async (email) => {
    const users = await readStore();
    return users.find((u) => u.email === email) || null;
  },

  findById: async (id) => {
    const users = await readStore();
    return users.find((u) => u.id === id) || null;
  },

  createUser: async (user) => {
    // Use a global lock (userId='__global__') for creation since user doesn't exist yet
    const mutex = getMutex('__global__');
    return mutex.runExclusive(async () => {
      const users = await readStore();
      if (users.find((u) => u.email === user.email)) {
        throw new Error('Email already registered');
      }
      users.push(user);
      await writeStore(users);
      return user;
    });
  },
};
