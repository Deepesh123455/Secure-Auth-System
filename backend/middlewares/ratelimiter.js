import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js"; 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  
  store: new RedisStore({
    
    sendCommand: (...args) => redisClient.call(...args),
    
  }),

  passOnStoreError: true,
  
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      status: "error",
      statusCode: options.statusCode,
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    });
  },
  

  skip: (req) => {
    const whitelistedIps = ["127.0.0.1", "::1"];
    return whitelistedIps.includes(req.ip);
  },
});

export default limiter;
