import catchAsync from "../utils/catchAsync.js";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";
import tokenService from "../services/token.service.js";
import emailService from "../services/email.service.js";
import redisClient from "../config/redis.js";


const cookieOptions = {
  httpOnly: true,
  secure: false, 
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/", 
};



const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  
  res.cookie("jwt", tokens.refreshToken, cookieOptions);
  res.status(201).json({ user, accessToken: tokens.accessToken });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);

 
  res.cookie("jwt", tokens.refreshToken, cookieOptions);
  res.json({ user, accessToken: tokens.accessToken });
});

const logout = catchAsync(async (req, res) => {
 
  await authService.logout(req.cookies.jwt);
  
  res.clearCookie("jwt", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

const refreshTokens = catchAsync(async (req, res) => {
  
  console.log("DEBUG REFRESH");
  console.log("Cookies received:", req.cookies);
  console.log("JWT Cookie value:", req.cookies?.jwt); 
  console.log("DEBUGGING ENDS HERE");

  
  const tokens = await authService.refreshAuth(req.cookies.jwt);

 
  res.cookie("jwt", tokens.refreshToken, cookieOptions);
  res.json({ accessToken: tokens.accessToken });
});

const googleCallback = catchAsync(async (req, res) => {
  const tokens = await tokenService.generateAuthTokens(req.user);

  
  res.cookie("jwt", tokens.refreshToken, cookieOptions);

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"; 
  res.redirect(`${clientUrl}/oauth/success?token=${tokens.accessToken}`);
});



const forgotPassword = catchAsync(async (req, res) => {
  const resetToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetToken);
  res.status(200).json({ message: "Reset link sent to email!" });
});

const resetPassword = catchAsync(async (req, res) => {
  await tokenService.resetPassword(req.query.token, req.body.password);
  res.status(200).json({ message: "Password reset successful" });
});



const getProfile = catchAsync(async (req, res) => {
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

const updateProfile = catchAsync(async (req, res) => {
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
