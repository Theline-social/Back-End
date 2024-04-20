import { body, param } from 'express-validator';
import { SubscriptionType } from '../../../entities';
import { SubscriptionService } from '../../../services/subscription.service';

const subscriptionService = new SubscriptionService();

const isValidType = (value: SubscriptionType) => {
  if (
    ![
      SubscriptionType.PROFESSIONAL,
      SubscriptionType.BUSINESS,
      SubscriptionType.INTERESTED,
    ].includes(value)
  ) {
    throw new Error('Invalid Type.');
  }
  return true;
};

export const addSubValidationRules = [
  body('fullname')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 2 characters'),

  body('type')
    .isString()
    .toUpperCase()
    .notEmpty()
    .withMessage('type is required')
    .custom(isValidType),
];

export const subscriptionIdParamsValidation = [
  param('subscriptionId')
    .exists()
    .toInt()
    .custom(async (id) => {
      const exists = await subscriptionService.exists(id);
      if (!exists) {
        throw new Error('subscription Id  does not exist');
      }
    })
    .withMessage('subscription does not exist'),
];
