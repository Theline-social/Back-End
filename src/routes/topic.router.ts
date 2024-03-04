import express, { Router } from 'express';
import * as topicsController from '../controllers/topic.controller';
import * as authController from '../controllers/auth.controller';
import { topicParamsValidation } from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /topics:
 *   get:
 *     summary: Get all topics
 *     description: Retrieves a list of all topics.
 *     security:
 *       - jwt: []
 *     tags: [topics]
 *     responses:
 *       '200':
 *         description: OK. Topics successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve topics.
 *
 *   post:
 *     summary: Add a new topic
 *     description: Adds a new topic.
 *     security:
 *       - jwt: []
 *     tags: [topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic_ar:
 *                 type: string
 *               topic_en:
 *                 type: string
 *               description_ar:
 *                 type: string
 *               description_en:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created. Topic successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to add the topic.
 */
router
  .route('/')
  .get(authController.requireAuth, topicsController.getTopics)
  .post(authController.requireAuth, topicsController.addTopic);

/**
 * @swagger
 * /topics/{topic}:
 *   delete:
 *     summary: Delete a topic
 *     description: Deletes a topic.
 *     security:
 *       - jwt: []
 *     tags: [topics]
 *     parameters:
 *       - in: path
 *         name: topic
 *         description: The name of the topic to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content. Topic successfully deleted.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Topic not found.
 *       '500':
 *         description: Internal Server Error. Failed to delete the topic.
 */
router
  .route('/:topic')
  .delete(authController.requireAuth, topicsController.deleteTopic);

/**
 * @swagger
 * /topics/{topic}/reels:
 *   get:
 *     summary: Get reels for a topic
 *     description: Retrieves reels for a specific topic.
 *     security:
 *       - jwt: []
 *     tags: [topics]
 *     parameters:
 *       - in: path
 *         name: topic
 *         description: The name of the topic.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Reels for the topic successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Topic not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve reels.
 *
 */
router
  .route('/:topic/reels')
  .get(
    authController.requireAuth,
    topicParamsValidation,
    topicsController.getTopicReels
  );

export { router as topicsRouter };
