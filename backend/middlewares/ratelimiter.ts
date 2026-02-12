import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { type NextFunction, type Request, type Response } from "express";
import redisClient from "../config/redis.js"; // .js extension hatado agar TS config sahi hai

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // Redis Store Configuration
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      (redisClient.call as any)(...args) as Promise<any>,
    prefix: "rl_common:", // ✅ IMP: Prefix add kiya taaki keys mix na ho
  }),

  // ✅ Fail Open Strategy: Agar Redis down hai, toh API mat roko, request jane do.
  // Industry mein hum availability ko priority dete hain.
  passOnStoreError: true,

  // Custom Error Handler
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    res.status(options.statusCode).json({
      status: "error",
      statusCode: options.statusCode,
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    });
  },

  // Skip Logic (Whitelist)
  skip: (req: Request) => {
    const ip = req.ip || "127.0.0.1";
    // IPv6 mapped IPv4 address bhi handle kiya
    const whitelistedIps = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];

    if (whitelistedIps.includes(ip)) {
      return true;
    }
    return false;
  },

  // 💡 Bonus Mastery Tip: Key Generator
  // Default IP se limit karta hai. Agar user logged in hai, toh UserID se limit karo.
});

export default limiter;
