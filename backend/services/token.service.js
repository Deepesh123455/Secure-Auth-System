import jwt from "jsonwebtoken";
import moment from "moment";
import crypto from "crypto";
import redisClient from "../config/redis.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (userId, secret, expiresIn) => {
  const payload = {
    sub: userId,
    iat: moment().unix(), 
  };
  return jwt.sign(payload, secret, { expiresIn });
};


const generateAuthTokens = async (user) => {
  
  const accessToken = generateToken(
    user._id,
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRATION
  );

  
  const refreshToken = generateToken(
    user._id,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRATION
  );

  
  await redisClient.set(
    `refresh_token:${user._id}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );

  return { accessToken, refreshToken };
};


const verifyRefreshToken = async (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const storedToken = await redisClient.get(`refresh_token:${payload.sub}`);

    if (!storedToken || storedToken !== token) {
      throw new Error();
    }

    return payload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};


const removeRefreshToken = async (userId) => {
  await redisClient.del(`refresh_token:${userId}`);
};


const generateResetPasswordToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expires = Date.now() + 10 * 60 * 1000;

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expires;
  await user.save();

  return resetToken;
};

/**
 
 * @param {string} token - The raw token from the URL
 * @param {string} newPassword - The new password
 */
const resetPassword = async (token, newPassword) => {
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
