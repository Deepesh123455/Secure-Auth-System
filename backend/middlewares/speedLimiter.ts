import slowDown, {type Options } from "express-slow-down";
import { RedisStore } from "rate-limit-redis";
import {type Request,type Response } from "express";
import redisClient from "../config/redis.js";


// Constants define karna maintainability ke liye better hai
const WINDOW_MS = 15 * 60 * 1000; // 15 Minutes
const DELAY_AFTER = 5; // 1 request ke baad slow karna harsh hai, 5 is standard
const BASE_DELAY_MS = 100;
const WHITELISTED_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];

/**
 * Redis Store Setup for Rate Limiting
 * Note: 'rate-limit-redis' needs the 'sendCommand' method from ioredis
 */
const redisSpeedStore = new RedisStore({
  
  sendCommand: (...args: string[]) => (redisClient.call as any)(...args) as Promise<any>, 
  prefix: "speed_limit:",
});

export const speedLimiter  = slowDown({
  windowMs: WINDOW_MS,
  delayAfter: DELAY_AFTER,
  delayMs: BASE_DELAY_MS,
  store: redisSpeedStore as any,

  /**
   * Skip Function:
   * Agar IP whitelist mein hai, toh true return karo (skip karo).
   */
  skip: (req: Request): boolean => {
    const ip = req.ip || "127.0.0.1"; // Fallback for safety

    if (WHITELISTED_IPS.includes(ip)) {
      console.log(`[SpeedLimit] 🟢 Skipped (Whitelisted): ${ip}`);
      return true; // ✅ CHANGE: Pehle tum false return kar rahe the (bug)
    }

    return false; // Do not skip
  },

  /**
   * On Limit Reached:
   * Sirf tab log karega jab user actual mein slow hona shuru hoga
   */
  onLimitReached: (req: Request, res: Response, options: any) => {
    console.warn(`[SpeedLimit] ⚠️ Throttling Request for IP: ${req.ip}`);
  } ,
} as any);