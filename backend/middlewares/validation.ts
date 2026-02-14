import Joi, { type Schema } from "joi";

// 1. Password Pattern ko constant banaya (Reusable)
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

const customPasswordMessage = {
  "string.pattern.base":
    "Password must be at least 8 characters long and contain at least 1 letter and 1 number",
};

// 2. Validation Object ka Interface define kiya
// Isse ensure hoga ki hum galti se "bdy" na likh de "body" ki jagah
interface ValidationSchema {
  body?: Schema;
  query?: Schema;
  params?: Schema;
  cookies?: Schema; 
}

// 3. Schemas ko Type Safety ke saath export kiya
export const register: ValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().trim().required().email(),
    name: Joi.string().trim().required(),
    password: Joi.string()
      .required()
      .pattern(passwordPattern)
      .messages(customPasswordMessage),
  }),
};

export const login: ValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().trim().required(),
    password: Joi.string().required(),
  }),
};

export const logout: ValidationSchema = {
  // Industry Tip: Logout mein refresh token aksar cookies mein hota hai
  cookies: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }).unknown(true), // Baaki cookies ko ignore karne ke liye
};

export const refreshTokens: ValidationSchema = {
  cookies: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }).unknown(true),
};

export const forgotPassword: ValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
  }),
};

export const resetPassword: ValidationSchema = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string()
      .required()
      .pattern(passwordPattern)
      .messages(customPasswordMessage),
  }),
};

export const updateProfile: ValidationSchema = {
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