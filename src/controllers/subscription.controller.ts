import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../common';
import { SubscriptionService } from '../services/subscription.service';

const subscriptionService = new SubscriptionService();

export const addSubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const imageUrl = req.body.imageUrl;
    const lang = req.headers['accept-language'] as string;

    const { subscription } = await subscriptionService.addSubscription(
      imageUrl,
      req.body,
      res.locals.currentUser,
      lang
    );

    res.status(201).json({
      status: true,
      message: 'Subscription created successfully',
      data: { subscription },
    });
  }
);

export const getSubscriptions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { subscriptions } = await subscriptionService.getSubscriptions();

    res.status(200).json({
      status: true,
      data: { subscriptions },
    });
  }
);

export const getSubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { subscription } = await subscriptionService.getSubscription(userId);

    res.status(200).json({
      status: true,
      data: { subscription },
    });
  }
);

export const acceptSubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const empName = res.locals.currentEmployee.name;
    const { subscription } = await subscriptionService.acceptSubscription(
      +req.params.subscriptionId,
      empName
    );

    res.status(200).json({
      status: true,
      message: 'subscription accepted successfully ',
      data: { subscription },
    });
  }
);

export const refuseSubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const empName = res.locals.currentEmployee.name;
    const { subscription } = await subscriptionService.refuseSubscription(
      +req.params.subscriptionId,
      empName
    );

    res.status(200).json({
      status: true,
      data: { subscription },
      message: 'subscription refused successfully ',
    });
  }
);

export const removeSubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await subscriptionService.removeSubscription(userId);

    res.status(200).json({
      status: true,
      message: 'subscription removed successfully ',
    });
  }
);

export const handleTransactionStatusChange = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await subscriptionService.handleTransactionStatusChange(req.body);
  }
);
