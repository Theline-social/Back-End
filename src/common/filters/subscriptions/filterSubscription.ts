import { Subscription } from '../../../entities';
import { SubscriptionDto } from './subDto';

export const filterSubscription = (
  subscription: Subscription
): SubscriptionDto => {
  return {
    type: subscription.type,
    status: subscription.status,
    liveImage: subscription.liveImage,
    createdAt: subscription.createdAt,
    fullname: subscription.fullname,
    subscriber: subscription.user
    ? {
      email: subscription.user.email,
      imageUrl: subscription.user.imageUrl,
      jobtitle: subscription.user.jobtitle,
      name: subscription.user.name,
      phoneNumber: subscription.user.phoneNumber,
      userId: subscription.user.userId,
      username: subscription.user.username,
    }: undefined,
  };
};
