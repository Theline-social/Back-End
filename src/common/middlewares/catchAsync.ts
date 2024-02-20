import { Request, Response, NextFunction } from 'express';

/**
 * catchAsync.ts
 *
 * This module exports a higher-order function that wraps an asynchronous
 * function and ensures any errors thrown during its execution are passed
 * to the Express `next` middleware. It simplifies error handling in
 * asynchronous routes or middleware functions.
 *
 * @param fn - An asynchronous function that handles the request, response, and next middleware.
 * @returns A new function that wraps the provided asynchronous function, catching any errors and passing them to the `next` middleware.
 */
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next); // Equivalent to catch(er => next(er))
  };
