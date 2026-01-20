import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import compression from "compression";
import morgan from "morgan";


import limiter from "./middlewares/ratelimiter.js";
import { speedLimiter } from "./middlewares/speedLimiter.js"; 
import googleStrategy from "./config/passport.js";
import ApiError from "./utils/ApiError.js";
import { errorConverter, errorHandler } from "./middlewares/errorhandler.js";


import authRoutes from "./routes/auth.routes.js";

const app = express();

app.set("trust proxy", 1);


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}


app.use(helmet());


app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);


app.use(speedLimiter);
app.use(limiter);


app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(compression());


passport.use(googleStrategy);
app.use(passport.initialize());


app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Server is up and running!",
    env: process.env.NODE_ENV,
  });
});

app.use("/api/auth", authRoutes);



app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});


app.use(errorConverter);


app.use(errorHandler);

export default app;
