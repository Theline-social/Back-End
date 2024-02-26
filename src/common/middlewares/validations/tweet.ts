import { body, param } from 'express-validator';
import { TweetsService } from '../../../services/tweet.service';

const tweetsService = new TweetsService();

export const tweetIdParamsValidation = [
  param('tweetId')
    .exists()
    .toInt()
    .custom(async (tweetId) => {
      const exists = await tweetsService.exists(tweetId);
      if (!exists) {
        throw new Error('muted id does not exist');
      }
    })
    .withMessage('tweet does not exist'),
];

export const replyIdParamsValidation = [
  param('replyId').exists().toInt().withMessage('tweet does not exist'),
];
