import express, { Router } from 'express';
import * as topicsController from '../controllers/topic.controller';
import * as authController from '../controllers/auth.controller';

const router: Router = express.Router();

/**
 * @swagger
 * /topics:
 *   get:
 *     summary: Get all topics
 *     description: Retrieves a list of all topics.
 *     security:
 *       - jwt: []
 *     tags: [Topics]
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
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
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
 *   get:
 *     summary: Get reels for a topic
 *     description: Retrieves reels for a specific topic.
 *     security:
 *       - jwt: []
 *     tags: [Topics]
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
 *   delete:
 *     summary: Delete a topic
 *     description: Deletes a topic.
 *     security:
 *       - jwt: []
 *     tags: [Topics]
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
  .get(authController.requireAuth, topicsController.getTopicReels)
  .delete(authController.requireAuth, topicsController.deleteTopic);

export { router as topicsRouter };
