import slowDown from "express-slow-down";
import { type Request, type Response } from "express";
import redisClient from "../config/redis.js";

// 🕒 Configuration Constants
const WINDOW_MS = 15 * 60 * 1000; // 15 Minutes window
const DELAY_AFTER = 5; // 5 requests ke baad slow karna
const BASE_DELAY_MS = 100; // Har extra request par 100ms delay
const WHITELISTED_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1", "unknown_ip"];

/**
 * 💡 THE MASTERSTROKE: Apna Khud Ka Custom Speed Store!
 * Bina kisi 3rd party package ke jhamale ke, direct aur fast Redis commands.
 */
const customSpeedRedisStore = {
  // Hit count badhane ka function
  increment: async (key: string) => {
    try {
      const fullKey = `speed_limit:${key}`;

      // Redis mein seedha hit count 1 se badhao
      const hits = await redisClient.incr(fullKey);

      // Agar yeh is IP ki pehli request hai, toh 15 mins ka timer laga do
      if (hits === 1) {
        await redisClient.expire(fullKey, WINDOW_MS / 1000);
      }

      return {
        totalHits: hits,
        resetTime: new Date(Date.now() + WINDOW_MS),
      };
    } catch (error) {
      console.error("[Custom Speed Store Error] ❌:", error);
      // Agar Redis fail ho jaye, toh request pass hone do (Crash mat karo)
      return { totalHits: 1, resetTime: new Date(Date.now() + WINDOW_MS) };
    }
  },

  // Hit count kam karne ka function (kabhi kabhi package ko chahiye hota hai)
  decrement: async (key: string) => {
    try {
      await redisClient.decr(`speed_limit:${key}`);
    } catch (e) {}
  },

  // IP ka record delete karne ka function
  resetKey: async (key: string) => {
    try {
      await redisClient.del(`speed_limit:${key}`);
    } catch (e) {}
  },
};

export const speedLimiter = slowDown({
  windowMs: WINDOW_MS,
  delayAfter: DELAY_AFTER,
  delayMs: BASE_DELAY_MS,

  // 👇 Apna bulletproof desi store lagao
  store: customSpeedRedisStore as any,

  /**
   * 🟢 Skip Function (VIP List):
   */
  skip: (req: Request): boolean => {
    const ip = req.ip || "127.0.0.1";
    if (WHITELISTED_IPS.includes(ip)) {
      return true; // Healthchecks / Localhost bypass
    }
    return false;
  },

  /**
   * ⚠️ On Limit Reached:
   */
  onLimitReached: (req: Request, res: Response, options: any) => {
    console.warn(
      `[SpeedLimit] 🐌 Throttling Request for IP: ${req.ip || "Unknown"}`,
    );
  },
} as any);
