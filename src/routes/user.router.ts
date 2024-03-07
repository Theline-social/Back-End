import express, { Router } from 'express';
import * as usersController from '../controllers/user.controller';
import * as authController from '../controllers/auth.controller';

import { userIdParamsValidation, validateRequest } from '../common';
import {
  changePasswordValidationRules,
  changeUsernameValidationRules,
  isuserFoundValidationRules,
  resetPasswordValidationRules,
} from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /users/current:
 *   get:
 *     summary: Get current user information
 *     description: Retrieves the information of the currently authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     responses:
 *       '200':
 *         description: OK. User information successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve user information.
 */

router.route('/current').get(authController.requireAuth, usersController.getMe);

/**
 * @swagger
 * /users/current/change-username:
 *   patch:
 *     summary: Change username
 *     description: Changes the username of the currently authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newUsername:
 *                 type: string
 *                 description: The new username for the user.
 *     responses:
 *       '200':
 *         description: OK. Username successfully changed.
 *       '400':
 *         description: Bad Request. Invalid request body.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to change username.
 */

router
  .route('/current/change-username')
  .patch(
    authController.requireAuth,
    changeUsernameValidationRules,
    validateRequest,
    usersController.changeUsername
  );

/**
 * @swagger
 * /users/current/change-password:
 *   patch:
 *     summary: Change password
 *     description: Changes the username of the currently authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currPassword:
 *                 type: string
 *                 description: The current password for the user.
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user.
 *               newPasswordConfirm:
 *                 type: string
 *                 description: The new re password for the user.
 *     responses:
 *       '200':
 *         description: OK. Username successfully changed.
 *       '400':
 *         description: Bad Request. Invalid request body.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to change username.
 */

router
  .route('/current/change-password')
  .patch(
    authController.requireAuth,
    changePasswordValidationRules,
    validateRequest,
    usersController.changePassword
  );

/**
 * @swagger
 * /users/current/reset-password:
 *   patch:
 *     summary: Reset password
 *     description: Reset the password of the currently authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user.
 *               newPasswordConfirm:
 *                 type: string
 *                 description: The new re password for the user.
 *     responses:
 *       '200':
 *         description: OK. Username successfully changed.
 *       '400':
 *         description: Bad Request. Invalid request body.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to change username.
 */
router
  .route('/current/reset-password')
  .patch(
    authController.requireResetToken,
    resetPasswordValidationRules,
    validateRequest,
    usersController.resetPassword
  );

/**
 * @swagger
 * /users/is-user-found:
 *   post:
 *     summary: Check if user is found
 *     description: Checks if a user with the provided email, phone number, or username is found.
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: string
 *                 description: The email, phone number, or username to check for.
 *     responses:
 *       '200':
 *         description: OK. User found.
 *       '404':
 *         description: Not Found. User not found.
 *       '400':
 *         description: Bad Request. Invalid request body.
 *       '500':
 *         description: Internal Server Error. Failed to check user presence.
 */

router
  .route('/is-user-found')
  .post(
    isuserFoundValidationRules,
    validateRequest,
    usersController.isUserFound
  );

/**
 * @swagger
 * /users/current/upload-photo-profile:
 *   post:
 *     summary: Upload and resize user profile photo.
 *     tags:
 *       - users
 *     description: Endpoint to upload and resize user profile photo.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image_profile
 *         type: file
 *         description: The user's profile photo to upload.
 *     responses:
 *       '200':
 *         description: User profile photo uploaded and resized successfully.
 *       '400':
 *         description: Bad request. The uploaded file is not an image.
 *       '500':
 *         description: Internal server error. Failed to upload or resize the user profile photo.
 */

router
  .route('/current/upload-photo-profile')
  .post(
    authController.requireAuth,
    usersController.uploadPhoto,
    usersController.resizePhoto
  );

/**
 * @swagger
 * /users/{userId}/followers:
 *   get:
 *     summary: Get followers of a user
 *     description: Retrieves the followers of a user by their user ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to get followers for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Followers successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Specified user not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve followers.
 */

router
  .route('/:userId/followers')
  .get(
    authController.requireAuth,
    userIdParamsValidation,
    validateRequest,
    usersController.getFollowers
  );

/**
 * @swagger
 * /users/{userId}/followings:
 *   get:
 *     summary: Get followings of a user
 *     description: Retrieves the followings of a user by their user ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to get followings for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. followings successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Specified user not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve followers.
 */
router
  .route('/:userId/followings')
  .get(
    authController.requireAuth,
    userIdParamsValidation,
    validateRequest,
    usersController.getFollowings
  );

/**
 * @swagger
 * /users/current/tweet-bookmarks:
 *   get:
 *     summary: Get tweet bookmarks of a user
 *     description: Retrieves the tweet bookmarks of a user by their user ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     responses:
 *       '200':
 *         description: OK. Tweet bookmarks successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Specified user not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve tweet bookmarks.
 */

router
  .route('/current/tweet-bookmarks')
  .get(authController.requireAuth, usersController.getTweetBookmarks);

/**
 * @swagger
 * /users/current/reel-bookmarks:
 *   get:
 *     summary: Get reel bookmarks of a user
 *     description: Retrieves the reel bookmarks of a user by their user ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     responses:
 *       '200':
 *         description: OK. reel bookmarks successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Specified user not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve tweet bookmarks.
 */
router
  .route('/current/reel-bookmarks')
  .get(authController.requireAuth, usersController.getReelBookmarks);
/**
 * @swagger
 * /users/current/tweet-mentions:
 *   get:
 *     summary: Get tweets mentioned user
 *     description: Retrieves tweets where the authenticated user is mentioned.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     responses:
 *       '200':
 *         description: OK. Tweets successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve tweets.
 */

router
  .route('/current/tweet-mentions')
  .get(authController.requireAuth, usersController.getTweetMentions);

/**
 * @swagger
 * /users/current/reel-mentions:
 *   get:
 *     summary: Get reels mentioned user
 *     description: Retrieves reels where the authenticated user is mentioned.
 *     security:
 *       - jwt: []
 *     tags:
 *       - users
 *     responses:
 *       '200':
 *         description: OK. Reels successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve tweets.
 */

router
  .route('/current/reel-mentions')
  .get(authController.requireAuth, usersController.getReelMentions);

/**
 * @swagger
 * /users/current/muted:
 *   get:
 *     summary: Get muted users
 *     description: Retrieve a list of muted users for the current user.
 *     security:
 *       - jwt: []
 *     tags: [users]
 *     responses:
 *       '200':
 *         description: OK. Muted users retrieved successfully.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve muted users.
 */
router
  .route('/current/muted')
  .get(authController.requireAuth, usersController.getMuted);

/**
 * @swagger
 * /users/current/blocked:
 *   get:
 *     summary: Get blocked users
 *     description: Retrieve a list of blocked users for the current user.
 *     security:
 *       - jwt: []
 *     tags: [users]
 *     responses:
 *       '200':
 *         description: OK. Blocked users retrieved successfully.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve blocked users.
 */
router
  .route('/current/blocked')
  .get(authController.requireAuth, usersController.getBlocked);

/**
 * @swagger
 * /users/{username}/profile:
 *   get:
 *     summary: Get the profile of a user by username
 *     description: Retrieve the profile data.
 *     security:
 *       - jwt: []
 *     tags: [users]
 *     parameters:
 *       - name: username
 *         in: path
 *         description: username of the user to get his profile.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Blocked users retrieved successfully.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve blocked users.
 */

router
  .route('/:username/profile')
  .get(authController.requireAuth, usersController.getUserProfile);

export { router as usersRouter };
