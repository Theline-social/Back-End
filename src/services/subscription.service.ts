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

    const checkFreeTrial = await subsRepository.exists({
      where: { userId: currUser.userId },
    });

    if (checkFreeTrial) throw new AppError('Free trial used before', 400);

    const subscription = new Subscription();
    subscription.userId = currUser.userId;
    subscription.type = body.type;
    subscription.fullname = body.fullname;
    subscription.liveImage = liveImage;
    subscription.status = SubscriptionStatus.DEACTIVATED;

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

  getSubscription = async (userId: number) => {
    const subsRepository = AppDataSource.getRepository(Subscription);

    const subscription = await subsRepository.findOne({
      where: { userId },
      relations: { user: true },
    });

    if (!subscription) throw new AppError('Subscription not found', 404);

    return {
      subscription: {
        subscriptionId: subscription.subscriptionId,
        type: subscription.type,
        status: subscription.status,
        fullname: subscription.fullname,
        reviewerEmployeeName: subscription.reviewerEmployeeName ?? undefined,
        reviewedAt: subscription.reviewedAt ?? undefined,
        isFreeTrialUsed: subscription.isFreeTrialUsed,
        endDate: subscription.endDate,
      },
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

    let currDate = new Date();
    currDate.setMonth(currDate.getMonth() + 1);
    subscription.endDate = currDate;
    subscription.status = SubscriptionStatus.ACTIVATED;
    await userRepository.update(
      { userId: subscription.userId },
      { subscriptionType: subscription.type }
    );
    subscription.reviewedAt = new Date();
    subscription.reviewerEmployeeName = employeeName;
    await subsRepository.save(subscription);

    return { subscription: filterSubscription(subscription) };
  };

  refuseSubscription = async (subscriptionId: number, employeeName: string) => {
    const subsRepository = AppDataSource.getRepository(Subscription);

    const subscription = await subsRepository.findOne({
      where: { subscriptionId },
      relations: { user: true },
    });

    if (!subscription) throw new AppError('Subscription not found', 404);

    subscription.reviewedAt = new Date();
    subscription.reviewerEmployeeName = employeeName;
    await subsRepository.save(subscription);

    return { subscription: filterSubscription(subscription) };
  };

  removeSubscription = async (userId: number) => {
    const subsRepository = AppDataSource.getRepository(Subscription);
    const userRepository = AppDataSource.getRepository(User);

    await userRepository.update(
      { userId },
      { subscriptionType: SubscriptionType.NONE }
    );

    await subsRepository.update(
      {
        userId,
        status: SubscriptionStatus.ACTIVATED,
      },
      { endDate: new Date(), status: SubscriptionStatus.DEACTIVATED }
    );
  };

  exists = async (id: number) => {
    const subsRepository = AppDataSource.getRepository(Subscription);

    return await subsRepository.exists({ where: { subscriptionId: id } });
  };

  handleTransactionStatusChange = async (transactionData: {
    Data: {
      CustomerReference: string;
      PaymentId: string;
      TransactionStatus: string;
      SubscriptionType: SubscriptionType;
    };
  }) => {
    console.log('Handling transaction status change:');
    console.log(transactionData);
    const subsRepository = AppDataSource.getRepository(Subscription);
    const userRepository = AppDataSource.getRepository(User);

    if (transactionData.Data.TransactionStatus !== 'SUCCESS')
      throw new AppError('Payment failed', 400);

    let currDate = new Date();
    currDate.setFullYear(currDate.getFullYear() + 1);
    subsRepository.update(
      {
        userId: +transactionData.Data.CustomerReference,
        type: transactionData.Data.SubscriptionType,
      },
      { endDate: currDate, status: SubscriptionStatus.ACTIVATED }
    );

    await userRepository.update(
      { userId: +transactionData.Data.CustomerReference },
      { subscriptionType: transactionData.Data.SubscriptionType }
    );
  };
}
