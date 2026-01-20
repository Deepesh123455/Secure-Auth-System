import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import redisClient from "../config/redis.js"; 

const auth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Please authenticate");
  }

  const token = authHeader.split(" ")[1];

  try {
   
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    
    const cachedUser = await redisClient.get(`user:${decoded.sub}`);

    if (cachedUser) {
      
      req.user = JSON.parse(cachedUser);
      return next();
    }

    
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new Error();
    }

    
    await redisClient.set(
      `user:${decoded.sub}`,
      JSON.stringify(user),
      "EX",
      3600
    );

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
});

export default auth;
