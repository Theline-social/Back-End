import { AppError, catchAsync } from '../common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/user.service';
import multer from 'multer';
import sharp from 'sharp';
import { AppDataSource } from '../dataSource';
import { User } from '../entities';

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

    res.cookie('reset_token', 'expired', {
      expires: new Date(Date.now() + 2 * 60 * 1000),
    });
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

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
});

export const resizePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return new AppError('No file Uploaded!', 400);
  const { userId } = res.locals.currentUser;
  const uniqueSuffix = Date.now() + '-' + userId;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(
      process.env.NODE_ENV !== 'production'
        ? `F:/MyRepos/Back-End-SM-Mostaql/assets/users/${req.file.filename}.jpeg`
        : `/home/TheLine/Back-End/assets/users/${req.file.filename}.jpeg`
    );

  await AppDataSource.getRepository(User).update(
    { userId },
    { imageUrl: `user-${uniqueSuffix}.jpeg` }
  );

  res.status(200).json({
    status: 200,
    message: 'Photo Uploaded Successfully',
  });
};

export const uploadPhoto = upload.single('image_profile');
