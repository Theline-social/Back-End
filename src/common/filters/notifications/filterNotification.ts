import { Notification } from '../../../entities';
import { NotificationDto } from './notificationSchema';

export const filterNotification = (
  notification: Notification,
  userId: number
): NotificationDto => {
  return {
    notificationId: notification.notificationId,
    isSeen: notification.isSeen,
    type: notification.type,
    createdAt: notification.createdAt,
    metadata: notification.metadata,
    notificationFrom: notification.notificationFrom
      ? {
          userId: notification.notificationFrom.userId,
          imageUrl: notification.notificationFrom.imageUrl,
          username: notification.notificationFrom.username,
          jobtitle: notification.notificationFrom.jobtitle,
          name: notification.notificationFrom.name,
          bio: notification.notificationFrom.bio,
          subscriptionType: notification.notificationFrom.subscriptionType,
          followersCount: notification.notificationFrom.followersCount,
          followingsCount: notification.notificationFrom.followingsCount,
          isMuted: notification.notificationFrom.isMutedBy(userId),
          isBlocked: notification.notificationFrom.isBlockedBy(userId),
          isFollowed: notification.notificationFrom.isFollowedBy(userId),
        }
      : null,
  };
};

export const filterSubNotification = (
  notification: Notification
): NotificationDto => {
  return {
    notificationId: notification.notificationId,
    isSeen: notification.isSeen,
    type: notification.type,
    createdAt: notification.createdAt,
    metadata: notification.metadata,
    notificationFrom: notification.notificationFrom
      ? {
          imageUrl: 'logo.jpg',
          name: 'TheLine Support Team',
        }
      : null,
  };
};
