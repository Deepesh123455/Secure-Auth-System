import {type Request,type Response,type NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User, {type IUser} from "../models/user.model.js";

import catchAsync from "../utils/catchAsync.js";
import redisClient from "../config/redis.js";


// Express ki Request interface ko extend karna padega taaki 'user' property allow ho sake
interface AuthRequest extends Request {
  user?: IUser;
}

const auth = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Please authenticate");
  }

  const token = authHeader.split(" ")[1] as string;

  try {
    // JWT Verify karte waqt payload ka interface define karna best practice hai
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { sub: string };

    // 1. Redis Cache Check
    const cachedUser = await redisClient.get(`user:${decoded.sub}`);

    if (cachedUser) {
      req.user = JSON.parse(cachedUser) as IUser;
      return next();
    }

    // 2. DB Check (if not in cache)
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new Error();
    }

    // 3. Set Cache (for 1 hour)
    await redisClient.set(
      `user:${decoded.sub}`,
      JSON.stringify(user),
      "EX",
      3600
    );

    req.user = user as IUser;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
});

export default auth;