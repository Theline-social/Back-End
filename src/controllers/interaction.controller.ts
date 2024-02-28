import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../common';

import { InteractionsService } from '../services/interaction.service';

const interactionsService = new InteractionsService();

export const toggleFollow = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await interactionsService.toggleFollow(+userId, req.params.followingUsername);

    res.status(200).json({
      status: true,
      messgae: `follow toggeled successfully`,
    });
  }
);

export const toggleMute = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await interactionsService.toggleMute(+userId, req.params.mutedUsername);

    res.status(200).json({
      status: true,
      messgae: `mute toggeled successfully`,
    });
  }
);

export const toggleBlock = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await interactionsService.toggleBlock(+userId,req.params.blockedUsername);

    res.status(200).json({
      status: true,
      messgae: `block toggeled successfully`,
    });
  }
);
