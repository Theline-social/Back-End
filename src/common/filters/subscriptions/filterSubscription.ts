import { Subscription } from '../../../entities';
import { SubscriptionDto } from './subDto';

export const filterSubscription = (
  subscription: Subscription
): SubscriptionDto => {
  return {
    subscriptionId: subscription.subscriptionId,
    type: subscription.type,
    status: subscription.status,
    liveImage: subscription.liveImage,
    createdAt: subscription.createdAt,
    fullname: subscription.fullname,
    activationEmployee: subscription.activationEmployee ?? undefined,
    activatedAt: subscription.activatedAt?? undefined,
    subscriber: subscription.user
      ? {
          email: subscription.user.email,
          imageUrl: subscription.user.imageUrl,
          jobtitle: subscription.user.jobtitle,
          name: subscription.user.name,
          phoneNumber: subscription.user.phoneNumber,
          userId: subscription.user.userId,
          username: subscription.user.username,
        }
      : undefined,
  };
};
