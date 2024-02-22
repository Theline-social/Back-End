/**
 * AppError.ts
 *
 * Custom error class that extends the built-in Error class. It is designed
 * to represent errors in the application and includes additional properties
 * such as statusCode, status, and isOperational. This class is intended to
 * be used for handling errors in a consistent way across the application.
 *
 * @class
 * @extends Error
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code associated with the error.
 */

export class AppError extends Error {
  statusCode: number;
  status: boolean;
  isOperational: boolean;

  /**
   * Creates an instance of AppError.
   * @constructor
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code associated with the error.
   */
  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = false;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
