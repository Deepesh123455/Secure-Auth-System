import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";


export const errorConverter = (err, req, res, next) => {
  let error = err;

  
  if (!(error instanceof ApiError)) {
    
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

    const message = error.message || String(error); 

   
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};


export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }


  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }


  res.status(statusCode).send(response);
};
