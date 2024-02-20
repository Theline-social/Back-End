import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { AppError } from '../utils/AppError';

/**
 * validateRequest.ts
 *
 * This module exports a middleware function that uses the express-validator
 * library to validate the request. If there are validation errors, it creates
 * an AppError instance with a 400 status code and passes it to the next
 * middleware. If there are no errors, it passes the request to the next
 * middleware in the stack.
 *
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error: ValidationError) => error.msg);
    const errorMessage = `Invalid input data: ${errorMessages.join('. ')}`;
    const statusCode = 400;

    const error = new AppError(errorMessage, statusCode);

    return next(error);
  }

  next();
};
