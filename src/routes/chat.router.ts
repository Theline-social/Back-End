import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as chatController from '../controllers/chat.controller';
import {
  conversationIdParamValidationRules,
  startChatValidationRules,
  validateRequest,
} from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /chats/start-chat:
 *   post:
 *     summary: Start a chat conversation
 *     description: Start a new chat conversation.
 *     tags:
 *       - chats
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 type: string 
 *     responses:
 *       '200':
 *         description: Chat conversation started successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to start chat conversation.
 */
router
  .route('/start-chat')
  .post(
    authController.requireAuth,
    startChatValidationRules,
    validateRequest,
    chatController.startConversation
  );

/**
 * @swagger
 * /chats/unseen-chats-count:
 *   get:
 *     summary: Get unseen chats count
 *     description: Get the count of unseen chat conversations for the authenticated user.
 *     tags:
 *       - chats
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Successful operation. Returns the count of unseen chat conversations.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to get unseen chats count.
 */
router
  .route('/unseen-chats-count')
  .get(authController.requireAuth, chatController.getUnseenConversationsCnt);

/**
 * @swagger
 * /chats/{conversationId}/history:
 *   post:
 *     summary: Get conversation history
 *     description: Get the history of a chat conversation by its ID.
 *     tags:
 *       - chats
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         description: ID of the conversation to get history for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation. Returns the conversation history.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to get conversation history.
 */
router
  .route('/:conversationId/history')
  .post(
    authController.requireAuth,
    conversationIdParamValidationRules,
    validateRequest,
    chatController.getConversationHistory
  );

export { router as chatRouter };
