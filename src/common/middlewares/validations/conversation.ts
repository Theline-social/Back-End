import { body, param } from 'express-validator';
import { ChatService } from '../../../services/chat.service';

const chatService = new ChatService();

export const startChatValidationRules = [
  body('username').isString().isEmpty().withMessage('username is required'),
];

export const conversationIdParamValidationRules = [
  param('conversationId')
    .exists()
    .toInt()
    .custom(async (conversationId) => {
      const exists = await chatService.exists(conversationId);
      if (!exists) {
        throw new Error('tweet id does not exist');
      }
    }),
];
