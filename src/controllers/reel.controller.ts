import multer from 'multer';
import sharp from 'sharp';

import { AppError, catchAsync } from '../common';
import { Request, Response, NextFunction } from 'express';
import { ReelsService } from '../services/reel.service';

const reelsService = new ReelsService();

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new Error('Not a video! Please upload a video file.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50, files: 1 },
});

export const saveReel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return new AppError('No file Uploaded!', 400);
  const { userId } = res.locals.currentUser;

  const uniqueSuffix = Date.now() + '-' + userId;

  await sharp(req.file.buffer).toFile(
    process.env.NODE_ENV !== 'production'
      ? `F:/MyRepos/Back-End-SM-Mostaql/assets/reels/reel-${uniqueSuffix}.jpeg`
      : `/home/TheLine/Back-End/assets/reels/reel-${uniqueSuffix}.jpeg`
  );

  res.locals.reelUrl = `/reels/reel-${uniqueSuffix}.jpeg`;
  next();
};

export const uploadReel = upload.single('reel');

export const addReel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const reelUrl = res.locals.reelUrl;

    await reelsService.addReel(userId, reelUrl, req.body);

    res.status(201).json({
      status: true,
      message: 'Reel added successfully',
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
    const { rereelers } = await reelsService.getReelReReelers(
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
    const { reacters } = await reelsService.getReelReacters(+req.params.reelId);

    res.status(200).json({
      status: true,
      data: { reacters },
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
      message: 'React added successfully',
    });
  }
);

export const addReplyToReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await reelsService.addReplyToReply(
      Number(userId),
      Number(req.params.reelId),
      Number(req.params.replyId),
      req.body
    );

    res.status(200).json({
      status: true,
      message: 'Reply added successfully',
    });
  }
);

export const toggleReplyReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await reelsService.toggleReplyReact(
      +userId,
      +req.params.reelId,
      +req.params.replyId
    );

    res.status(200).json({
      status: true,
      message: 'Reply react added successfully',
    });
  }
);

export const addRereel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { rereel } = await reelsService.addReReel(
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
