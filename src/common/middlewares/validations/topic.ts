import { body, param } from 'express-validator';
import { TopicsService } from '../../../services/topics.service';
import { AppError } from '../../utils/AppError';

const topicsService = new TopicsService();

export const AddTopicValidationRules = [
  body('description_en')
    .isString()
    .notEmpty()
    .withMessage('description_en is required'),
  body('description_ar')
    .isString()
    .notEmpty()
    .withMessage('description_ar is required'),
  body('topic_ar').isString().notEmpty().withMessage('topic_ar is required'),
  body('topic_en').isString().notEmpty().withMessage('topic_en is required'),
];

export const topicIdParamsValidation = [
  param('topicId')
    .exists()
    .toInt()
    .custom(async (tweetId) => {
      const exists = await topicsService.existsbyId(tweetId);
      if (!exists) {
        throw new Error('topic does not exist');
      }
    })
    .withMessage('topic does not exist'),
];

export const topicParamsValidation = [
  param('topic')
    .exists()
    .custom(async (topic) => {
      const exists = await topicsService.existsbyTopicName(topic);
      
      if (!exists) {
        throw new AppError('topic does not exist', 404);
      }
    })
    .withMessage('topic does not exist'),
];
