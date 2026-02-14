import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "http://localhost:5000/api/auth/google/callback",
  },
  async (accessToken : string, refreshToken : string, profile : Profile , done : VerifyCallback) => {
    try {
     
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
       
        user.googleAccessToken = accessToken;
       
        if (refreshToken) {
          user.googleRefreshToken = refreshToken;
        }
        await user.save();
        return done(null, user);
      }

      
      const email  = profile.emails?.[0]?.value;
      user = await User.findOne({ email });

      if (user) {
        
        user.googleId = profile.id;
        user.googleAccessToken = accessToken;
        if (refreshToken) user.googleRefreshToken = refreshToken;

        await user.save();
        return done(null, user);
      }

  
      const newUser = await User.create({
        googleId: profile.id,
        email: email,
        name: (profile as any).displayName,
        isEmailVerified: true,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, false);
    }
  }
);

export default googleStrategy;
