import { AppDataSource } from '../dataSource';
import { Notification } from '../entities';

export class NotificationsService {
  constructor() {}

  getNotifications = async (userId: number) => {
    const notificationRepository = AppDataSource.getRepository(Notification);

    const notifications = await notificationRepository.find({
      where: { notificationTo: { userId } },
      order: { createdAt: 'DESC' },
    });

    return { notifications };
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
}
