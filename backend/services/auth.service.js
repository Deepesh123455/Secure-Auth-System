import tokenService from "./token.service.js";
import userService from "./user.service.js";
import User from "../models/user.model.js"; 
import ApiError from "../utils/ApiError.js";

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, "Incorrect email or password");
  }
  return user;
};

const logout = async (refreshToken) => {
  const payload = await tokenService.verifyRefreshToken(refreshToken);
  await tokenService.removeRefreshToken(payload.sub);
};


const refreshAuth = async (refreshToken) => {
  try {
    const payload = await tokenService.verifyRefreshToken(refreshToken);
    const user = await userService.getUserById(payload.sub);
    if (!user) throw new Error();

    await tokenService.removeRefreshToken(user._id);
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(401, "Please authenticate");
  }
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
};
