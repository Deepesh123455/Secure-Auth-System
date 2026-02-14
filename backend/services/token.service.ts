import jwt, { type JwtPayload } from "jsonwebtoken";
import moment from "moment";
import crypto from "crypto";
import redisClient from "../config/redis.js";
import ApiError from "../utils/ApiError.js";
import User, {type IUser} from "../models/user.model.js";
import dotenv from "dotenv";
import type { ObjectId } from "mongoose";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  sub: string;
}
const generateToken = (userId : string, secret : string, expiresIn : string | number) => {
  const payload : CustomJwtPayload = {
    sub: userId,
    iat: moment().unix(), 
  };
  return jwt.sign(payload, secret, { expiresIn });
};


const generateAuthTokens = async (user : IUser) => {
  
  const accessToken = generateToken(
    String(user?._id),
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRATION || "1d",
  );

  
  const refreshToken = generateToken(
    String(user._id),
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRATION || "7d",
  );

  
  await redisClient.set(
    `refresh_token:${user._id}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );

  return { accessToken, refreshToken };
};


const verifyRefreshToken = async (token : string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { sub: string };
    const storedToken = await redisClient.get(`refresh_token:${payload.sub}`);

    if (!storedToken || storedToken !== token) {
      throw new Error();
    }

    return payload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};


const removeRefreshToken = async (userId : string) => {
  await redisClient.del(`refresh_token:${userId}`);
};


const generateResetPasswordToken = async (email : string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expires : Date = Date.now() + 10 * 60 * 1000 as unknown as Date;

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expires;
  await user.save();

  return resetToken;
};

/**
 
 * @param {string} token - The raw token from the URL
 * @param {string} newPassword - The new password
 */
const resetPassword = async (token : string, newPassword : string) => {
  if (!token) throw new ApiError(400, "Token is required");

  
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }

  
  user.password = newPassword;


  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  
  await redisClient.del(`refresh_token:${user._id}`);
};

export default {
  generateAuthTokens,
  verifyRefreshToken,
  removeRefreshToken,
  generateResetPasswordToken,
  resetPassword, 
};
