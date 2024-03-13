import express, { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import * as authController from '../controllers/auth.controller';

const router: Router = express.Router();

/**
 * @swagger
 * /users/current/notifications:
 *   get:
 *     summary: Get notifications
 *     description: Retrieve notifications for the authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - notifications
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of tweets per page (default 10, max 100)
 *     responses:
 *       '200':
 *         description: OK. Notifications retrieved successfully.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve notifications.
 */

router
  .route('/notifications')
  .get(authController.requireAuth, notificationsController.getNotifications);

/**
 * @swagger
 * /users/current/notifications/unseen-count:
 *   get:
 *     summary: Get unseen notification count
 *     description: Retrieve the count of unseen notifications for the authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - notifications
 *     responses:
 *       '200':
 *         description: OK. Unseen notification count retrieved successfully.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve unseen notification count.
 */

router
  .route('/notifications/unseen-count')
  .get(
    authController.requireAuth,
    notificationsController.getUnseenNotificationCount
  );

/**
 * @swagger
 * /users/current/notifications/mark-all-seen:
 *   patch:
 *     summary: Mark all unseen notifications as seen
 *     description: Mark all unseen notifications as seen for the authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - notifications
 *     responses:
 *       '200':
 *         description: OK. All unseen notifications marked as seen successfully.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to mark all unseen notifications as seen.
 */

router
  .route('/notifications/mark-all-seen')
  .patch(
    authController.requireAuth,
    notificationsController.markAllUnseenNotificationsAsSeen
  );

export { router as notificationsRouter };
