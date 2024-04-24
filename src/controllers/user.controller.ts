import { AppError, catchAsync } from '../common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/user.service';
import multer from 'multer';
import sharp from 'sharp';
import { AppDataSource } from '../dataSource';
import { User } from '../entities';

const usersService = new UsersService();

const storage = multer.memoryStorage();

export const fileFilter = (
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

export const uploadProfileMedia = upload.fields([
  { name: 'banner_profile', maxCount: 1 },
  { name: 'image_profile', maxCount: 1 },
]);

export const processProfileMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files) return next();

  try {
    const image_profile = (req.files as Record<string, any>)[
      'image_profile'
    ] as Express.Multer.File[];

    if (image_profile) {
      const imageUrl = `user-${
        Date.now() + '-' + Math.round(Math.random() * 1e9)
      }.jpeg`;

      await sharp(image_profile[0].buffer, { animated: true })
        .toFormat('jpeg')
        .resize(500, 500)
        .jpeg({ quality: 90 })
        .toFile(
          process.env.NODE_ENV !== 'production'
            ? `${process.env.DEV_MEDIA_PATH}/users/${imageUrl}`
            : `${process.env.PROD_MEDIA_PATH}/users/${imageUrl}`
        );

      req.body.imageUrl = imageUrl;
    }

    const banner_profile = (req.files as Record<string, any>)[
      'banner_profile'
    ] as Express.Multer.File[];

    if (banner_profile) {
      const bannerUrl = `user-${
        Date.now() + '-' + Math.round(Math.random() * 1e9)
      }.jpeg`;

      await sharp(banner_profile[0].buffer, { animated: true })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(
          process.env.NODE_ENV !== 'production'
            ? `${process.env.DEV_MEDIA_PATH}/users/${bannerUrl}`
            : `${process.env.PROD_MEDIA_PATH}/users/${bannerUrl}`
        );

      req.body.bannerUrl = bannerUrl;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const savePhoto = async (req: Request, res: Response) => {
  const { userId } = res.locals.currentUser;

  await usersService.savePhoto(userId, req.body.imageUrl);

  res.status(200).json({
    status: 200,
    message: 'Photo Uploaded Successfully',
    data: {
      imageUrl: req.body.imageUrl,
    },
  });
};

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

export const getFollowers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;
    const userId = res.locals.currentUser.userId;

    const { followers } = await usersService.getFollowers(
      userId,
      +req.params.userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { followers },
    });
  }
);

export const getFollowings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;
    const userId = res.locals.currentUser.userId;

    const { followings } = await usersService.getFollowings(
      userId,
      +req.params.userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { followings },
    });
  }
);

export const getTweetBookmarks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;
    const { bookmarks } = await usersService.getTweetBookmarks(
      +userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { bookmarks },
    });
  }
);

export const getReelBookmarks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const lang = req.headers['accept-language'] as string;

    const { page, limit } = req.query;
    const { bookmarks } = await usersService.getReelBookmarks(
      +userId,
      lang,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { bookmarks },
    });
  }
);

export const getTweetMentions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;
    const { mentions } = await usersService.getTweetMentions(
      +userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { mentions },
    });
  }
);

export const getReelMentions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const lang = req.headers['accept-language'] as string;

    const { page, limit } = req.query;
    const { mentions } = await usersService.getReelMentions(
      +userId,
      lang,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { mentions },
    });
  }
);

export const getBlocked = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const { page, limit } = req.query;

    const { blocked } = await usersService.getBlocked(
      +userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { blocked },
    });
  }
);

export const getMuted = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const { page, limit } = req.query;

    const { muted } = await usersService.getMuted(
      +userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { muted },
    });
  }
);

export const getUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const { user } = await usersService.getUserProfile(
      req.params.username,
      +userId
    );

    res.status(200).json({
      status: true,
      data: { user },
    });
  }
);

export const searchUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    let { page, limit, nameorusername } = req.query;

    const { users } = await usersService.search(
      +userId,
      nameorusername as string,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { users },
    });
  }
);

export const editUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { user } = await usersService.editUserProfile(+userId, req.body);

    res.status(200).json({
      status: true,
      message: 'User profile updated successfully',
      data: { user },
    });
  }
);

export const getUserTweets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const { page, limit } = req.query;
    const { tweets } = await usersService.getUserTweets(
      +userId,
      req.params.username,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      message: 'User profile updated successfully',
      data: { tweets },
    });
  }
);

export const getUserReels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const { page, limit } = req.query;
    const lang = req.headers['accept-language'] as string;

    const { reels } = await usersService.getUserReels(
      +userId,
      req.params.username,
      lang,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      message: 'User profile updated successfully',
      data: { reels },
    });
  }
);

export const getUserJobs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const { page, limit } = req.query;
    const lang = req.headers['accept-language'] as string;

    const { jobs } = await usersService.getUserJobs(
      +userId,
      req.params.username,
      lang,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      message: 'User profile updated successfully',
      data: { jobs },
    });
  }
);

export const changeEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await usersService.changeEmail(+userId, req.body);

    res.status(200).json({
      status: true,
      message: 'email updated successfully',
    });
  }
);

export const changePhoneNumber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await usersService.changePhoneNumber(+userId, req.body);

    res.status(200).json({
      status: true,
      message: 'phone number updated successfully',
    });
  }
);
