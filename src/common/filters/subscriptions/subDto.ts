import { SubscriptionStatus, SubscriptionType } from '../../../entities';

export interface SubscriptionDto {
  subscriptionId:number;
  fullname: string;
  createdAt: Date;
  liveImage: string;
  status: SubscriptionStatus;
  type: SubscriptionType;
  reviewerEmployeeName: string;
  reviewedAt: Date;
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
