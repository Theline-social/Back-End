import {
  EmployeeStatus,
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
  User,
} from '../entities';
import { AppDataSource } from '../dataSource';
import { AppError, Email, filterSubscription } from '../common';
import schedule from 'node-schedule';

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
      where: { userId: currUser.userId, type: body.type },
    });

    if (checkFreeTrial) throw new AppError('Free trial used before', 400);

    const subscription = new Subscription();
    subscription.userId = currUser.userId;
    subscription.type = body.type;
    subscription.fullname = body.fullname;
    subscription.liveImage = liveImage;
    subscription.status = SubscriptionStatus.PENDING;

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

    const subscriptions = await subsRepository.find({
      where: { userId },
    });

    if (!subscriptions) throw new AppError('Subscription not found', 404);

    const activeSubscription = subscriptions.find(
      (subscription) =>
        subscription.status === SubscriptionStatus.ACTIVATED ||
        subscription.status === SubscriptionStatus.PENDING
    );

    const isFreeTrailBusinessUsed =
      subscriptions.filter(
        (subscription) => subscription.type === SubscriptionType.BUSINESS
      )[0]?.isFreeTrialUsed || false;

    const isFreeTrailProfessionalUsed =
      subscriptions.filter(
        (subscription) => subscription.type === SubscriptionType.PROFESSIONAL
      )[0]?.isFreeTrialUsed || false;

    const isFreeTrailInterestedUsed =
      subscriptions.filter(
        (subscription) => subscription.type === SubscriptionType.INTERESTED
      )[0]?.isFreeTrialUsed || false;

    return {
      subscription: activeSubscription
        ? {
            subscriptionId: activeSubscription.subscriptionId,
            type: activeSubscription.type,
            status: activeSubscription.status,
            fullname: activeSubscription.fullname,
            reviewerEmployeeName:
              activeSubscription.reviewerEmployeeName ?? undefined,
            reviewedAt: activeSubscription.reviewedAt ?? undefined,
            endDate: activeSubscription.endDate,
          }
        : null,
      isFreeTrialUsed: {
        INTERESTED: isFreeTrailInterestedUsed,
        PROFESSIONAL: isFreeTrailProfessionalUsed,
        BUSINESS: isFreeTrailBusinessUsed,
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
    subscription.isFreeTrialUsed = true;
    subscription.reviewedAt = new Date();
    subscription.reviewerEmployeeName = employeeName;
    const savedSub = await subsRepository.save(subscription);

    await userRepository.update(
      { userId: subscription.userId },
      { subscriptionType: subscription.type }
    );

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setMinutes(thirtyDaysFromNow.getMinutes() + 5);
    console.log("start");
    

    schedule.scheduleJob(thirtyDaysFromNow, async () => {
      const updatedSubscription = await subsRepository.findOne({
        where: { subscriptionId },
      });
      if (updatedSubscription) {
        updatedSubscription.status = SubscriptionStatus.DEACTIVATED;
        await subsRepository.save(updatedSubscription);
      }
    });

    return { subscription: filterSubscription(savedSub) };
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
    subscription.status = SubscriptionStatus.REJECTED;
    const savedSub = await subsRepository.save(subscription);

    return { subscription: filterSubscription(savedSub) };
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
