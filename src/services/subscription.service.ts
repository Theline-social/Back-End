import {
  EmployeeStatus,
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
  User,
} from '../entities';
import { AppDataSource } from '../dataSource';
import { AppError, Email, filterSubscription } from '../common';

export class SubscriptionService {
  constructor() {}

  addSubscription = async (
    liveImage: string,
    body: {
      type: SubscriptionType;
      fullname: string;
    },
    currUser: {
      userId: number;
      name: string;
      email: string;
    },
    lang: string
  ) => {
    const subsRepository = AppDataSource.getRepository(Subscription);

    const subscription = new Subscription();
    subscription.userId = currUser.userId;
    subscription.type = body.type;
    subscription.fullname = body.fullname;
    subscription.liveImage = liveImage;
    subscription.status = SubscriptionStatus.DEACTIVATEd;

    const savedSubscription = await subsRepository.save(subscription);

    await new Email({
      email: currUser.email,
      name: currUser.name,
    }).sendSubscriptionEmail(lang, body.type);

    return { subscription: filterSubscription(savedSubscription) };
  };

  getSubscriptions = async () => {
    const subsRepository = AppDataSource.getRepository(Subscription);

    const subscriptions = await subsRepository.find({
      relations: { user: true },
    });

    return {
      subscriptions: subscriptions.map((subscription) =>
        filterSubscription(subscription)
      ),
    };
  };

  acceptSubscription = async (subscriptionId: number, employeeName: string) => {
    const subsRepository = AppDataSource.getRepository(Subscription);
    const userRepository = AppDataSource.getRepository(User);

    const subscription = await subsRepository.findOne({
      where: { subscriptionId },
      relations: { user: true },
    });

    if (!subscription) throw new AppError('Subscription not found', 404);

    subscription.status = SubscriptionStatus.ACTIVATED;
    await userRepository.update(
      { userId: subscription.userId },
      { subscriptionType: subscription.type }
    );
    subscription.activatedAt = new Date();
    subscription.activationEmployee = employeeName;
    await subsRepository.save(subscription);

    return { subscription: filterSubscription(subscription) };
  };

  refuseSubscription = async (subscriptionId: number) => {
    const subsRepository = AppDataSource.getRepository(Subscription);

    await subsRepository.delete({
      subscriptionId,
    });
  };

  removeSubscription = async (userId: number) => {
    const subsRepository = AppDataSource.getRepository(Subscription);
    const userRepository = AppDataSource.getRepository(User);

    await userRepository.update(
      { userId },
      { subscriptionType: SubscriptionType.NONE }
    );

    await subsRepository.delete({
      userId,
    });
  };

  exists = async (id: number) => {
    const subsRepository = AppDataSource.getRepository(Subscription);

    return await subsRepository.exists({ where: { subscriptionId: id } });
  };
}
