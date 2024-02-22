import { catchAsync } from '../common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/user.service';

const usersService = new UsersService();

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { user } = await usersService.currentAuthedUser(userId);

    res.status(200).json({
      status: true,
      data: {
        user: user,
      },
    });
  }
);

export const changeUsername = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    await usersService.changeUsername(userId, req.body);

    res.status(200).json({
      status: true,
      message: 'Username updated successfully',
    });
  }
);

export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    await usersService.changePassword(userId, req.body);

    res.status(200).json({
      status: true,
      message: 'Password updated successfully',
    });
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    await usersService.resetPassword(userId, req.body);

    res.status(200).json({
      status: true,
      message: 'Password reset successfully',
    });
  }
);

export const isUserFound = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { isFound, data } = await usersService.isUserFound(req.body);

    res.status(200).json({
      status: true,
      isFound,
      data,
    });
  }
);
