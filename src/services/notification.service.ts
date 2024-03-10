import { json } from 'express';
import { filterNotification } from '../common';
import {
  userProfileRelations,
  userProfileSelectOptions,
} from '../common/filters/users/userSelectOptions';
import { AppDataSource } from '../dataSource';
import { Notification, NotificationType } from '../entities';

export class NotificationsService {
  constructor() {}

  getNotifications = async (userId: number) => {
    const notificationRepository = AppDataSource.getRepository(Notification);

    const notifications = await notificationRepository.find({
      where: { notificationTo: { userId } },
      select: {
        notificationId: true,
        type: true,
        content: true,
        createdAt: true,
        isSeen: true,
        metadata: true,
        notificationFrom: userProfileSelectOptions,
      },
      relations: {
        notificationFrom: userProfileRelations,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      notifications: notifications.map((notification) =>
        filterNotification(notification, userId)
      ),
    };
  };

  getUnseenNotificationCount = async (userId: number) => {
    const notificationRepository = AppDataSource.getRepository(Notification);

    return await notificationRepository.count({
      where: { notificationTo: { userId }, isSeen: false },
    });
  };

  markAllUnseenNotificationsAsSeen = async (userId: number) => {
    const notificationRepository = AppDataSource.getRepository(Notification);

    await notificationRepository.update(
      { isSeen: false, notificationTo: { userId } },
      { isSeen: true }
    );
  };

  deleteNotification = async (
    metadata: Record<string, any>,
    type: NotificationType
  ) => {
    await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .where('metadata::jsonb @> :metadata', { metadata }) 
      .andWhere('type = :type', { type })
      .execute();
  };

  deleteNotificationBySenderAndReceiver = async (
    fromUserId: number,
    toUserId: number,
    type: NotificationType
  ) => {
    await AppDataSource.getRepository(Notification).delete({
      type,
      notificationTo: { userId: toUserId },
      notificationFrom: { userId: fromUserId },
    });
  };
}
