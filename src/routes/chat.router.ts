import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as chatController from '../controllers/chat.controller';
import {
  conversationIdParamValidationRules,
  startChatValidationRules,
  validateRequest,
} from '../common';

const router: Router = express.Router();

router
  .route('/start-chat')
  .post(
    authController.requireAuth,
    startChatValidationRules,
    validateRequest,
    chatController.startConversation
  );

router
  .route('/unseen-chats-count')
  .get(authController.requireAuth, chatController.getUnseenConversationsCnt);

router
  .route('/:conversatoinId/history')
  .post(
    authController.requireAuth,
    conversationIdParamValidationRules,
    validateRequest,
    chatController.getConversationHistory
  );

export { router as chatRouter };
