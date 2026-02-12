import Joi, {   type Schema } from "joi";
import ApiError from "../utils/ApiError.js";
import {  type NextFunction, type Request, type Response } from "express";


/**
 * Create an object composed of the picked object properties
 * @param object Source object (T)
 * @param keys Array of keys to pick (K)
 * @returns New object with picked keys (Pick<T, K>)
 */

interface ValidationSchema {
  body?: Schema;
  query?: Schema;
  params?: Schema;
  cookies?: Schema;
}
const pick = <T extends object, K extends keyof T>(
  object: T,
  keys: K[],
): Pick<T, K> => {
  return keys.reduce(
    (obj, key) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        obj[key] = object[key];
      }
      return obj;
    },
    {} as Pick<T, K>,
  );
};

const validate =
  (schema: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema  , ["params", "query", "body", "cookies"]);

    const object = pick(req , Object.keys(validSchema) as  Array<keyof Request>);

    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(", ");
      return next(new ApiError(400, errorMessage));
    }

    Object.assign(req, value);
    return next();
  };

export default validate;
