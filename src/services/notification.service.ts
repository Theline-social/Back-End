import { json } from 'express';
import { filterNotification } from '../common';
import {
  userProfileRelations,
  userProfileSelectOptions,
} from '../common/filters/users/userSelectOptions';
import { AppDataSource } from '../dataSource';
import { Notification, NotificationType } from '../entities';
export class NotificationsService {
  constructor() {
  
  }

  getNotifications = async (
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const notificationRepository = AppDataSource.getRepository(Notification);

    const notifications = await notificationRepository.find({
      where: { notificationTo: { userId } },
      select: {
        notificationId: true,
        type: true,
        createdAt: true,
        isSeen: true,
        metadata: true,
        notificationFrom: userProfileSelectOptions,
      },
      relations: {
        notificationFrom: userProfileRelations,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
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
      { isSeen: true, seenAt: new Date() }
    );
  };

  deleteNotification = async (
    metadata: Record<string, any>,
    type: NotificationType
  ) => {
    const deletedNotifications = await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .select('Notification.notificationId')
      .where('metadata::jsonb @> :metadata', { metadata })
      .andWhere('type = :type', { type })
      .execute();

    await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .where('metadata::jsonb @> :metadata', { metadata })
      .andWhere('type = :type', { type })
      .execute();

    console.log(deletedNotifications);

    return {
      notificationId: deletedNotifications[0].Notification_notificationId,
    };
  };

  deleteNotificationBySenderAndReceiver = async (
    fromUserId: number,
    toUserId: number,
    type: NotificationType
  ) => {
    const notification = await AppDataSource.getRepository(
      Notification
    ).findOne({
      select: { notificationId: true },
      where: {
        type,
        notificationTo: { userId: toUserId },
        notificationFrom: { userId: fromUserId },
      },
    });

    await AppDataSource.getRepository(Notification).delete({
      type,
      notificationTo: { userId: toUserId },
      notificationFrom: { userId: fromUserId },
    });

    return { notificationId: notification?.notificationId };
  };

  deleteOldNotifications = async () => {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      await notificationRepository
        .createQueryBuilder()
        .delete()
        .where('seenAt <= :threeDaysAgo', { threeDaysAgo })
        .execute();

      console.log('Old notifications deleted successfully');
    } catch (error) {
      console.error('Error deleting old notifications:', error);
    }
  };
}
