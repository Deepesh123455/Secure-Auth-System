import express from "express";
import passport from "passport";


import authController from "../controllers/auth.controller.js";


import validate from "../middlewares/validate.js";

import auth from "../middlewares/auth.middleware.js";


import * as authValidation from "../middlewares/validation.js";


const router = express.Router();


router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);


router.post(
  "/login",

  validate(authValidation.login),
  authController.login
);


router.post("/refresh-tokens", authController.refreshTokens);


router.post(
  "/forgot-password",

  validate(authValidation.forgotPassword),
  authController.forgotPassword
);


router.post(
  "/reset-password",

  validate(authValidation.resetPassword),
  authController.resetPassword
);



router.post("/logout", auth, authController.logout);


router.get("/profile", auth, authController.getProfile);


router.patch(
  "/profile",

  auth,
  validate(authValidation.updateProfile),
  authController.updateProfile
);



router.get(
  "/google",

  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  authController.googleCallback
);

export default router;
