import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../common';
import { NotificationsService } from '../services/notification.service';

const notificationsService = new NotificationsService();

export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;
    const notifications = await notificationsService.getNotifications(
      userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { notifications },
    });
  }
);

export const getUnseenNotificationCount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const count = await notificationsService.getUnseenNotificationCount(userId);

    res.status(200).json({
      status: true,
      data: { count },
    });
  }
);

export const markAllUnseenNotificationsAsSeen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await notificationsService.markAllUnseenNotificationsAsSeen(userId);

    res.status(200).json({
      status: true,
      message: 'All unseen notifications marked as seen successfully',
    });
  }
);
