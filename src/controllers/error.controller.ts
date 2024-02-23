import { AppError } from '../common';

interface ErrorWithCode extends Error {
  code?: string;
  detail?: string;
}

export const handleCastErrorDB = (err: ErrorWithCode): AppError => {
  const message = `Invalid ${err.name}: ${err.message}.`;
  return new AppError(message, 400);
};

export const handleDuplicateFieldsDB = (err: ErrorWithCode): AppError => {
  const regex = /Key \(([^)]+)\)=\(([^)]+)\) already exists\./;
  const match = err.detail?.match(regex);

  if (match) {
    const fieldName = match[1];
    const value = match[2];

    const message = `A record with the provided ${fieldName} (${value}) already exists. Please use another value.`;
    return new AppError(message, 400);
  }

  return new AppError(
    'Duplicate field with the given value. Please use another value.',
    400
  );
};

// export const handleValidationErrorDB = (err: ErrorWithCode): AppError => {
//   const errors = Object.values(err.errors).map((el: any) => el.message);
//   const message = `Invalid input data: ${errors.join('. ')}`;
//   return new AppError(message, 400);
// };

export const handleJWTError = (): AppError =>
  new AppError('Invalid token!', 401);

export const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

export const sendErrorProd = (err: AppError, req: any, res: any): void => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

export const sendErrorDev = (err: AppError, req: any, res: any): void =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

export const globalErrorHandler = (
  err: AppError,
  req: any,
  res: any,
  next: any
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || false;

  if (process.env.NODE_ENV === 'production') {
    let error = Object.assign({}, err);
    error.message = err.message;

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    // if (error.code === '23505') {
    //   error = handleDuplicateFieldsDB(error);
    // }
    if (error.name === 'ValidationError') {
      //   error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};
