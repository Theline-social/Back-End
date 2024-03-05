import { body, param, query } from 'express-validator';
import { TweetsService } from '../../../services/tweet.service';

const tweetsService = new TweetsService();

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const tweetIdParamsValidation = [
  param('tweetId')
    .exists()
    .toInt()
    .custom(async (tweetId) => {
      const exists = await tweetsService.exists(tweetId);
      if (!exists) {
        throw new Error('tweet id does not exist');
      }
    })
    .withMessage('tweet does not exist'),
];

export const pollIdParamsValidation = [
  param('pollId')
    .exists()
    .toInt()
    .custom(async (pollId) => {
      const exists = await tweetsService.pollExists(pollId);
      if (!exists) {
        throw new Error('poll does not exist');
      }
    })
    .withMessage('poll does not exist'),
];

export const optionIdParamsValidation = [
  param('optionId').exists().toInt().withMessage('option does not exist'),
];

export const replyIdParamsValidation = [
  param('replyId').exists().toInt().withMessage('tweet does not exist'),
];

export const contentValidation = [
  body('content').exists().toInt().withMessage('content does not exist'),
];

export const addPollValidationRules = [
  body('question').notEmpty().isString(),
  body('length').notEmpty().isString(),
  body('options')
    .isArray()
    .custom((value, { req }) => {
      if (value.length > 4) {
        throw new Error('Maximum number of options is 4');
      }
      return true;
    }),
];
