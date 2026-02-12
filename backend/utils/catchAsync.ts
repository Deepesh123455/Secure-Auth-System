import type {Request, Response, NextFunction, RequestHandler } from "express";


/**
 
 * @param {Function} fn
 * @returns {Function}
 */
const catchAsync =
  (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req , res, next)).catch((err) => next(err));
  };

export default catchAsync;
