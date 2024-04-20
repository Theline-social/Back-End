import { SubscriptionStatus, SubscriptionType } from '../../../entities';

export interface SubscriptionDto {
  fullname: string;
  createdAt: Date;
  liveImage: string;
  status: SubscriptionStatus;
  type: SubscriptionType;
  subscriber?: {
    userId: number;
    imageUrl: string;
    username: string;
    jobtitle: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}
