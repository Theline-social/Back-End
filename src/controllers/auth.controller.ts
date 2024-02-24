/**
 * File: authController.ts
 * Description: This file contains the authentication-related controllers for user signup, signin, and OAuth2 authentication.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../common';
import { AppError } from '../common';
import AuthService from '../services/auth.service';
import { OtpProvider, User } from '../entities';
import { AppDataSource } from '../dataSource';

const authService = new AuthService();

interface FilteredUser extends Partial<User> {}

export const filterObj = (
  obj: Record<string, any>,
  ...fields: string[]
): Record<string, any> => {
  const filteredObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (fields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

export const signToken = (
  id: string,
  expiresInh: string,
  secretKey: string
): string =>
  jwt.sign({ id }, secretKey, {
    expiresIn: Number(expiresInh || '1') * 60 * 60,
  });

const createAndSendToken = (
  user: User,
  req: Request,
  res: Response,
  statusCode: number,
  cookieName: string = 'access_token',
  expiresInh: string = `${process.env.ACCESS_TOKEN_EXPIRESIN}`
): void => {
  let secretKey =
    cookieName === 'access_token'
      ? process.env.ACCESSTOKEN_SECRET_KEY
      : cookieName === 'reset_token'
      ? process.env.RESETTOKEN_SECRET_KEY
      : '';

  const token = signToken(
    user.userId.toString(),
    expiresInh,
    secretKey as string
  );

  res.cookie(cookieName, token, {
    expires: new Date(Date.now() + Number(expiresInh || '1') * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  const userWithoutPassword: FilteredUser = { ...user };
  delete userWithoutPassword.password;
  res.status(statusCode).json({
    status: true,
    data: { user: userWithoutPassword, token },
  });
};

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { user } = await authService.signup(req.body);

  createAndSendToken(user, req, res, 201);
});

export const checkValidOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isValid = await authService.checkValidOtp(req.body);

    if (!isValid) throw new AppError('Invalid OTP!', 400);

    res.status(200).json({
      status: true,
      message: `${req.body.provider} confirmed successfully`,
    });
  }
);

export const checkValidOtpAndAssignResetToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isValid = await authService.checkValidOtp(req.body);

    if (!isValid) throw new AppError('Invalid OTP ', 400);

    const userRepository = AppDataSource.getRepository(User);
    let user: User | null = null;
    if (req.body.provider === OtpProvider.PHONE) {
      user = await userRepository.findOneBy({ phoneNumber: req.body.input });
    } else if (req.body.provider === OtpProvider.EMAIL) {
      user = await userRepository.findOneBy({ email: req.body.input });
    }

    if (!user) throw new AppError('User not found', 404);
    createAndSendToken(user, req, res, 200, 'reset_token', '0.25');
  }
);

export const sendConfirmationOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lang = req.headers['accept-language'] as string;
    
    await authService.sendConfirmationOtp(req.body, lang);

    res.status(200).json({
      status: true,
      message: 'Confirmation OTP has been sent successfully',
    });
  }
);

export const signin = catchAsync(async (req: Request, res: Response) => {
  const { user } = await authService.login(req.body);

  createAndSendToken(user, req, res, 200);
});

export const validateRecaptcha = catchAsync(
  async (req: Request, res: Response) => {
    const isValid = await authService.validateRecaptcha(req.body);

    if (!isValid) throw new AppError('reCAPTCHA verification failed', 400);

    res.status(200).json({
      status: true,
      message: 'successful recaptcha verification',
    });
  }
);

export const signWithGoogle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { existingUser } = await authService.signWithGoogle(body);

    createAndSendToken(existingUser as User, req, res, 200);
  }
);

export const signout = (req: Request, res: Response): void => {
  res.cookie('access_token', 'loggedout', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true,
  });

  res.status(200).json({ status: true, message: 'Signed out successfully' });
};

export const requireAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in, please login to get access', 401)
      );
    }

    const { user } = await authService.checkAuth(
      token,
      process.env.ACCESSTOKEN_SECRET_KEY!
    );

    res.locals.currentUser = user;
    next();
  }
);

export const requireResetToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.reset_token) {
      token = req.cookies.reset_token;
    }

    if (!token) {
      return next(
        new AppError(
          'You must validate your identity to access this resource, go to forget password',
          401
        )
      );
    }

    const { user } = await authService.checkAuth(
      token,
      process.env.RESETTOKEN_SECRET_KEY!
    );

    res.locals.currentUser = user;
    next();
  }
);

export { createAndSendToken };
