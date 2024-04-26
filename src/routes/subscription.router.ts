import express, { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import * as authController from '../controllers/auth.controller';
import * as usersController from '../controllers/user.controller';
import {
  addSubValidationRules,
  subscriptionIdParamsValidation,
  validateRequest,
} from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /subscriptions/add-subscription:
 *   post:
 *     summary: Add a new subscription
 *     description: Add a new subscription to the user.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               image_profile:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Subscription added successfully
 *       '400':
 *         description: Bad request, validation error
 */
router
  .route('/add-subscription')
  .post(
    authController.requireAuth,
    usersController.uploadProfileMedia,
    usersController.processProfileMedia,
    addSubValidationRules,
    validateRequest,
    subscriptionController.addSubscription
  );

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get all subscriptions
 *     description: Retrieve a list of all subscriptions.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default 1)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Number of results per page (default 10)
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A list of subscriptions
 */
router
  .route('/')
  .get(authController.requireEmpAuth, subscriptionController.getSubscriptions);

/**
 * @swagger
 * /subscriptions/my-subscription:
 *   get:
 *     summary: Get all subscriptions
 *     description: Retrieve a list of all subscriptions.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of subscriptions
 */
router
  .route('/my-subscription')
  .get(authController.requireAuth, subscriptionController.getSubscription);

/**
 * @swagger
 * /subscriptions/{subscriptionId}/accept:
 *   patch:
 *     summary: Accept a subscription
 *     description: Accept a subscription with the specified subscription ID.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         description: ID of the subscription to accept
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Subscription accepted successfully
 *       '400':
 *         description: Bad request, validation error
 */
router
  .route('/:subscriptionId/accept')
  .patch(
    authController.requireEmpAuth,
    subscriptionIdParamsValidation,
    validateRequest,
    subscriptionController.acceptSubscription
  );

/**
 * @swagger
 * /subscriptions/{subscriptionId}/refuse:
 *   patch:
 *     summary: Refuse a subscription
 *     description: Refuse a subscription with the specified subscription ID.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         description: ID of the subscription to refuse
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Subscription refused successfully
 *       '400':
 *         description: Bad request, validation error
 */
router
  .route('/:subscriptionId/refuse')
  .patch(
    authController.requireEmpAuth,
    subscriptionIdParamsValidation,
    validateRequest,
    subscriptionController.refuseSubscription
  );

/**
 * @swagger
 * /remove-current-subscription:
 *   patch:
 *     summary: Remove current subscription
 *     description: Remove the current subscription associated with the authenticated user.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Subscription removed successfully
 *       '401':
 *         description: Unauthorized, authentication token is missing or invalid
 *       '500':
 *         description: Internal server error
 */
router
  .route('/remove-current-subscription')
  .patch(
    authController.requireAuth,
    subscriptionController.removeSubscription
  );

/**
 * @swagger
 * /transaction-status-hook:
 *   post:
 *     summary: handle Transaction Status Change
 *     description:  handle Transaction Status Change
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Subscription removed successfully
 *       '401':
 *         description: Unauthorized, authentication token is missing or invalid
 *       '500':
 *         description: Internal server error
 */
router
  .route('/transaction-status-hook')
  .post(subscriptionController.handleTransactionStatusChange);

export { router as subscriptionsRouter };
