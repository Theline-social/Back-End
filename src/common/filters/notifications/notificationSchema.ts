import { NotificationType } from "../../../entities";
import { ProfileDto } from "../users/userDto";

export interface NotificationDto  {
  notificationId: number,
  content: string,
  isSeen: boolean,
  type: NotificationType,
  createdAt: Date,
  metadata: any,
  notificationFrom: ProfileDto
};
