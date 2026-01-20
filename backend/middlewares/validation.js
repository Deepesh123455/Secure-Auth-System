import Joi from "joi";


const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export const register = {
  body: Joi.object().keys({
    email: Joi.string().trim().required().email(),
    name: Joi.string().trim().required(),
    password: Joi.string().required().pattern(passwordPattern).messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain at least 1 letter and 1 number",
    }),
  }),
};

export const login = {
  body: Joi.object().keys({
    email: Joi.string().trim().required(),
    password: Joi.string().required(),
  }),
};

export const logout = {
  cookies: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const refreshTokens = {
  cookies: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
  }),
};

export const resetPassword = {
 
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().pattern(passwordPattern).messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain at least 1 letter and 1 number",
    }),
  }),
};

export const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string().trim(),
    email: Joi.string().trim().email(),
  }),
};

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  updateProfile,
};
