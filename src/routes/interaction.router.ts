import express, { Router } from 'express';
import * as interactionsController from '../controllers/interaction.controller';
import * as authController from '../controllers/auth.controller';

import {
  blockedIdIdParamsValidation,
  followingIdParamsValidation,
  mutedIdIdParamsValidation,
  validateRequest,
} from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /users/current/toggle-follow/{followingId}:
 *   patch:
 *     summary: Toggle follow status
 *     description: Toggles the follow status between the authenticated user and the specified user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - interactions
 *     parameters:
 *       - name: followingId
 *         in: path
 *         description: ID of the user to follow/unfollow.
 *         required: true
 *         schema:
 *           type: integer
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
  .route('/toggle-follow/:followingId')
  .patch(
    authController.requireAuth,
    followingIdParamsValidation,
    validateRequest,
    interactionsController.toggleFollow
  );

/**
 * @swagger
 * /users/current/toggle-mute/{mutedId}:
 *   patch:
 *     summary: Toggle mute status
 *     description: Toggles the mute status between the authenticated user and the specified user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - interactions
 *     parameters:
 *       - name: mutedId
 *         in: path
 *         description: ID of the user to mute/unmute.
 *         required: true
 *         schema:
 *           type: integer
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
  .route('/toggle-mute/:mutedId')
  .patch(
    authController.requireAuth,
    mutedIdIdParamsValidation,
    validateRequest,
    interactionsController.toggleMute
  );

/**
 * @swagger
 * /users/current/toggle-block/{blockedId}:
 *   patch:
 *     summary: Toggle block status
 *     description: Toggles the block status between the authenticated user and the specified user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - interactions
 *     parameters:
 *       - name: blockedId
 *         in: path
 *         description: ID of the user to block/unblock.
 *         required: true
 *         schema:
 *           type: integer
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
  .route('/toggle-block/:blockedId')
  .patch(
    authController.requireAuth,
    blockedIdIdParamsValidation,
    validateRequest,
    interactionsController.toggleBlock
  );

export { router as interactionsRouter };
