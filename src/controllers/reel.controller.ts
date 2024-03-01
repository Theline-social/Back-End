import multer from 'multer';
import sharp from 'sharp';

import { AppError, catchAsync } from '../common';
import { Request, Response, NextFunction } from 'express';
import { ReelsService } from '../services/reel.service';

const reelsService = new ReelsService();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath =
      process.env.NODE_ENV !== 'production'
        ? 'F:/MyRepos/Back-End-SM-Mostaql/assets/reels'
        : '/home/TheLine/Back-End/assets/reels';

    cb(null, destinationPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    req.body.reelUrl = `/reels/reel-${uniqueSuffix}.mp4`;

    cb(null, `reel-${uniqueSuffix}.mp4`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'video/mp4') {
    cb(null, true);
  } else {
    cb(new Error('un supported video format'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50, files: 1 },
});

export const uploadReel = upload.single('reel');

export const getTimelineReels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { timelineReels } = await reelsService.getTimelineReels(
      userId,
      +(page as string),
      +(limit as string)
    );

    res.status(201).json({
      status: true,
      message: 'Tweets fetched successfully',
      data: { timelineReels },
    });
  }
);

export const addReel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { reel } = await reelsService.addReel(userId, req.body);

    res.status(201).json({
      status: true,
      message: 'Reel added successfully',
      data: { reel },
    });
  }
);

export const deleteReel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await reelsService.deleteReel(Number(req.params.reelId));

    res.status(200).json({
      status: true,
      message: 'Reel deleted successfully',
    });
  }
);

export const getReelReplies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { replies } = await reelsService.getReelReplies(
      +userId,
      +req.params.reelId
    );

    res.status(200).json({
      status: true,
      data: { replies },
    });
  }
);

export const getReelReReelers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { rereelers } = await reelsService.getReelReReelers(
      +userId,
      +req.params.reelId
    );

    res.status(200).json({
      status: true,
      data: { rereelers },
    });
  }
);

export const getReelReacters = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { reacters } = await reelsService.getReelReacters(
      +userId,
      +req.params.reelId
    );

    res.status(200).json({
      status: true,
      data: { reacters },
    });
  }
);

export const getReelReReels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { rereels } = await reelsService.getReelReReels(
      +userId,
      +req.params.reelId
    );

    res.status(200).json({
      status: true,
      data: { rereels },
    });
  }
);

export const getReel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { reel } = await reelsService.getReel(+userId, +req.params.reelId);

    res.status(200).json({
      status: true,
      data: {
        reel,
      },
    });
  }
);

export const addReelReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { reelReply } = await reelsService.addReelReply(
      +userId,
      +req.params.reelId,
      req.body
    );

    res.status(200).json({
      status: true,
      message: 'Reel reply added successfully',
      data: { reelReply },
    });
  }
);

export const toggleReelReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await reelsService.toggleReelReact(+userId, +req.params.reelId);

    res.status(200).json({
      status: true,
      message: 'React toggled successfully',
    });
  }
);

export const addRereel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { rereel } = await reelsService.addRereel(
      +userId,
      +req.params.reelId,
      req.body
    );

    res.status(200).json({
      status: true,
      message: 'Rereel added successfully',
      data: { rereel },
    });
  }
);

export const toggleBookmark = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await reelsService.toggleBookmark(+userId, +req.params.reelId);

    res.status(200).json({
      status: true,
      message: 'reel bookmark toggled successfully',
    });
  }
);
