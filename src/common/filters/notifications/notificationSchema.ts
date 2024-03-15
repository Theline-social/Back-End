import { NotificationType } from '../../../entities';
import { ProfileDto } from '../users/userDto';

export interface NotificationDto {
  notificationId: number;
  isSeen: boolean;
  type: NotificationType;
  createdAt: Date;
  metadata: any;
  notificationFrom: ProfileDto;
}
