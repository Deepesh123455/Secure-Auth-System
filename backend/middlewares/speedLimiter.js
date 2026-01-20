import slowDown from "express-slow-down";
import redisClient from "../config/redis.js";
import { RedisStore } from "rate-limit-redis";

const redisSpeedStore = new RedisStore({
  sendCommand: (...args) => redisClient.call(...args),
  prefix: "speed_limit:",
});

export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 1,
  delayMs: (hits) => hits * 100,
  store: redisSpeedStore,

  
  skip: (req) => {
    console.log(`[SpeedLimit] Checking IP: ${req.ip}`); 

    const whitelistedIps = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
    const isWhitelisted = whitelistedIps.includes(req.ip);

    if (isWhitelisted) {
      console.log(`[SpeedLimit] Skipped (Whitelisted): ${req.ip}`);
    }

    
    return false;
  },

  
  onLimitReached: (req, res, options) => {
    console.log(`[SpeedLimit] ⚠️ THROTTLING STARTED for IP: ${req.ip}`);
  },
});
