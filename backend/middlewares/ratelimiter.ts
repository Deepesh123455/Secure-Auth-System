import rateLimit from "express-rate-limit";
import { type NextFunction, type Request, type Response } from "express";
import redisClient from "../config/redis.js"; 

const WINDOW_MS = 15 * 60 * 1000; // 15 Minutes
const MAX_REQUESTS = 100;

// 💡 THE MASTERSTROKE: Apna Khud Ka Custom Store!
// Bhaad mein gaya 'rate-limit-redis', hum direct ioredis use karenge.
const customRedisStore = {
  // express-rate-limit jab bhi limit badhana chahega, yeh function chalega
  increment: async (key: string) => {
    try {
      const fullKey = `rl_custom:${key}`;
      
      // Redis mein value 1 se badhao (Agar nahi hai toh 1 set kar dega)
      const hits = await redisClient.incr(fullKey);

      // Agar yeh pehli request hai, toh Redis mein iska expiry timer (15 mins) laga do
      if (hits === 1) {
        await redisClient.expire(fullKey, WINDOW_MS / 1000);
      }

      return {
        totalHits: hits,
        resetTime: new Date(Date.now() + WINDOW_MS),
      };
    } catch (error) {
      console.error("[Custom Redis Store Error] ❌:", error);
      // Agar Redis down hai, toh server na phate (Fail Open)
      return { totalHits: 1, resetTime: new Date(Date.now() + WINDOW_MS) };
    }
  },
  
  // Decrease hit count
  decrement: async (key: string) => {
    try {
      await redisClient.decr(`rl_custom:${key}`);
    } catch (e) {}
  },
  
  // Reset completely
  resetKey: async (key: string) => {
    try {
      await redisClient.del(`rl_custom:${key}`);
    } catch (e) {}
  }
};

const limiter = rateLimit({
  windowMs: WINDOW_MS, 
  max: MAX_REQUESTS, 
  standardHeaders: true, 
  legacyHeaders: false, 

  // 👇 Yahan humne apna custom store laga diya
  store: customRedisStore as any, 

  handler: (req: Request, res: Response, next: NextFunction, options) => {
    res.status(options.statusCode).json({
      status: "error",
      statusCode: options.statusCode,
      message: "Too many requests from this IP, please try again after 15 minutes",
    });
  },

  skip: (req: Request) => {
    const ip = req.ip || "127.0.0.1";
    const whitelistedIps = ["127.0.0.1", "::1", "::ffff:127.0.0.1", "unknown_ip"];
    return whitelistedIps.includes(ip);
  },
});

export default limiter;