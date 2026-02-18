import {type Request,type Response,type CookieOptions } from "express";
import catchAsync from "../utils/catchAsync.js";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";
import tokenService from "../services/token.service.js";
import emailService from "../services/email.service.js";
import redisClient from "../config/redis.js";
import ApiError from "../utils/ApiError.js";

// ✅ Mastery Tip: Production mein 'secure: true' hona chahiye
const cookieOptions: CookieOptions = {
  httpOnly: true,
  // ⚠️ CRITICAL CHANGE: Force false until you have https://
  secure: false, 
  // ⚠️ CRITICAL CHANGE: 'none' requires Secure=true, so use 'lax'
  sameSite: "lax", 
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.cookie("jwt", tokens.refreshToken, cookieOptions);
  res.status(201).json({ user, accessToken: tokens.accessToken });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);

  res.cookie("jwt", tokens.refreshToken, cookieOptions);
  res.json({ user, accessToken: tokens.accessToken });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Logout logic mein token DB se bhi hatana chahiye (Optional mastery step)
  // await authService.logout(req.cookies?.jwt); 
  
  res.clearCookie("jwt", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.jwt || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const tokens = await authService.refreshAuth(incomingRefreshToken);

  res.cookie("jwt", tokens.refreshToken, cookieOptions);
  res.json({ accessToken: tokens.accessToken });
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  // Yahan req.user ab defined hai (thanks to express.d.ts)
  if (!req.user) {
    throw new ApiError(401, "Google Authentication Failed");
  }

  const tokens = await tokenService.generateAuthTokens(req.user);

  res.cookie("jwt", tokens.refreshToken, cookieOptions);

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(`${clientUrl}/oauth/success?token=${tokens.accessToken}`);
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const resetToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetToken);
  res.status(200).json({ message: "Reset link sent to email!" });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // Query params string bhi ho sakte hain, type casting needed
  const token = req.query.token as string;
  await tokenService.resetPassword(token, req.body.password);
  res.status(200).json({ message: "Password reset successful" });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  // ✅ FIX: Ab '_id' error nahi dega kyunki req.user IUser hai
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  const userId = req.user._id; 
  const cacheKey = `user_profile:${userId}`;

  const cachedUser = await redisClient.get(cacheKey);
  if (cachedUser) {
    return res.json({ user: JSON.parse(cachedUser) });
  }

  const user = await userService.getUserById(userId);
  if (!user) throw new ApiError(404, "User not found");

  await redisClient.set(cacheKey, JSON.stringify(user), "EX", 3600);
  res.json({ user });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "User not authenticated");
  
  const user = await userService.updateUserById(req.user._id, req.body);
  res.json({ user });
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  googleCallback,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};