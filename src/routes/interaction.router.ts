import express, { Router } from 'express';
import * as interactionsController from '../controllers/interaction.controller';
import * as authController from '../controllers/auth.controller';

import {
  blockedUsernameParamsValidation,
  followingUsernameParamsValidation,
  mutedUsernameParamsValidation,
  validateRequest,
} from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /users/current/toggle-follow/{followingUsername}:
 *   patch:
 *     summary: Toggle follow status
 *     description: Toggles the follow status between the authenticated user and the specified user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - interactions
 *     parameters:
 *       - name: followingUsername
 *         in: path
 *         description: Username of the user to follow/unfollow.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Follow status toggled successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Specified user not found.
 *       '500':
 *         description: Internal Server Error. Failed to toggle follow status.
 */

router
  .route('/toggle-follow/:followingUsername')
  .patch(
    authController.requireAuth,
    followingUsernameParamsValidation,
    validateRequest,
    interactionsController.toggleFollow
  );

/**
 * @swagger
 * /users/current/toggle-mute/{mutedUsername}:
 *   patch:
 *     summary: Toggle mute status
 *     description: Toggles the mute status between the authenticated user and the specified user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - interactions
 *     parameters:
 *       - name: mutedUsername
 *         in: path
 *         description: Username of the user to mute/unmute.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Mute status toggled successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Specified user not found.
 *       '500':
 *         description: Internal Server Error. Failed to toggle mute status.
 */
router
  .route('/toggle-mute/:mutedUsername')
  .patch(
    authController.requireAuth,
    mutedUsernameParamsValidation,
    validateRequest,
    interactionsController.toggleMute
  );

/**
 * @swagger
 * /users/current/toggle-block/{blockedUsername}:
 *   patch:
 *     summary: Toggle block status
 *     description: Toggles the block status between the authenticated user and the specified user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - interactions
 *     parameters:
 *       - name: blockedUsername
 *         in: path
 *         description: Username of the user to block/unblock.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Block status toggled successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Specified user not found.
 *       '500':
 *         description: Internal Server Error. Failed to toggle block status.
 */
router
  .route('/toggle-block/:blockedUsername')
  .patch(
    authController.requireAuth,
    blockedUsernameParamsValidation,
    validateRequest,
    interactionsController.toggleBlock
  );

export { router as interactionsRouter };
