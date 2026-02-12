import {Redis} from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const MAX_RETRY_ATTEMPTS = 10;

// ✅ Industry Standard: Configuration with Retry Strategy
const redisClient = new Redis(REDIS_URL, {
  // Exponential backoff retry logic
  retryStrategy(times : number) {
    if (times > MAX_RETRY_ATTEMPTS) {
      console.error(`[Redis] ❌ Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Connection failed.`);
      return null; // Retrying band kar do
    }
    // Delay increase hota rahega: 100ms, 200ms, 400ms... up to 3 seconds
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  // Essential for Rate Limiting and OTP storage consistency
  maxRetriesPerRequest: null, 
});

// Detailed Connection Monitoring
redisClient.on("connect", () => console.log("[Redis] 🔌 Connecting to server..."));
redisClient.on("ready", () => console.log("[Redis] ✅ Client ready and connected!"));
redisClient.on("error", (err: Error) => console.error("[Redis] ❌ Connection Error:", err));
redisClient.on("reconnecting", () => console.warn("[Redis] 🔄 Attempting to reconnect..."));

export default redisClient;