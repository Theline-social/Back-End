import express, { Router } from 'express';
import * as usersController from '../controllers/user.controller';
import * as authController from '../controllers/auth.controller';

import {
  changeEmailValidationRules,
  changePhoneValidationRules,
  userIdParamsValidation,
  usernameParamsValidation,
  validateRequest,
} from '../common';
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
 *       - settings
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
 *       - settings
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
 * /users/current/change-email:
 *   patch:
 *     summary: Change user's email
 *     description: Change the email address of the currently authenticated user.
 *     tags:
 *       - settings
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *                 description: The new email address for the user.
 *           required:
 *             - newEmail
 *     responses:
 *       '200':
 *         description: Email changed successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to change email.
 */

router
  .route('/current/change-email')
  .patch(
    authController.requireAuth,
    changeEmailValidationRules,
    validateRequest,
    usersController.changeEmail
  );

/**
 * @swagger
 * /users/current/change-phonenumber:
 *   patch:
 *     summary: Change user's phone number
 *     description: Change the phone number of the currently authenticated user.
 *     tags:
 *       - settings
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPhoneNumber:
 *                 type: string
 *                 description: The new phone number for the user.
 *           required:
 *             - newPhoneNumber
 *     responses:
 *       '200':
 *         description: Phone number changed successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to change phone number.
 */
router
  .route('/current/change-phonenumber')
  .patch(
    authController.requireAuth,
    changePhoneValidationRules,
    validateRequest,
    usersController.changePhoneNumber
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
    usersController.uploadProfileMedia,
    usersController.processProfileMedia,
    usersController.savePhoto
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
 *       - profile
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
 *       - profile
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
 *       - profile
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
 *       - profile
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
 *     tags: [profile]
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
 *     tags: [profile]
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
 *     tags:
 *       - profile
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

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search for users by name or username
 *     description: |
 *       This endpoint allows authenticated users to search for other users by their name or username.
 *       Results are sorted by relevance and returned with pagination.
 *     tags:
 *       - search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nameorusername
 *         description: Name or username to search for (partial match)
 *         schema:
 *           type: string
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
 *         description: OK. users retrieved successfully.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve users.
 */

router
  .route('/search')
  .get(authController.requireAuth, usersController.searchUsers);

/**
 * @swagger
 * /users/current/edit-profile:
 *   patch:
 *     summary: Edit current user's profile
 *     description: Edit the profile of the currently authenticated user.
 *     tags:
 *       - profile
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: image_profile
 *         in: formData
 *         description: file of the user's profile image.
 *         required: false
 *         type: file
 *       - name: banner_profile
 *         in: formData
 *         description: banner file of the user's profile.
 *         required: false
 *         type: file
 *       - name: name
 *         in: formData
 *         description: Name of the user.
 *         required: false
 *         type: string
 *       - name: bio
 *         in: formData
 *         description: Biography of the user.
 *         required: false
 *         type: string
 *       - name: location
 *         in: formData
 *         description: Location of the user.
 *         required: false
 *         type: string
 *       - name: jobtitle
 *         in: formData
 *         description: Job title of the user.
 *         required: false
 *         type: string
 *       - name: birthday
 *         in: formData
 *         description: Birthday of the user.
 *         required: false
 *         type: string
 *         format: date
 *     responses:
 *       '200':
 *         description: Profile edited successfully.
 *       '400':
 *         description: Bad request. Invalid data provided.
 *       '401':
 *         description: Unauthorized. User must be authenticated.
 *       '500':
 *         description: Internal server error. Failed to edit profile.
 */
router
  .route('/current/edit-profile')
  .patch(
    authController.requireAuth,
    usersController.uploadProfileMedia,
    usersController.processProfileMedia,
    usersController.editUserProfile
  );

/**
 * @swagger
 * /users/{username}/tweets:
 *   get:
 *     summary: Get current user's tweets
 *     description: Retrieve tweets posted by the currently authenticated user.
 *     tags:
 *       - profile
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Successful operation. Returns the user's tweets.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve tweets.
 */
router
  .route('/:username/tweets')
  .get(
    authController.requireAuth,
    usernameParamsValidation,
    validateRequest,
    usersController.getUserTweets
  );

/**
 * @swagger
 * /users/{username}/reels:
 *   get:
 *     summary: Get current user's reels
 *     description: Retrieve reels posted by the currently authenticated user.
 *     tags:
 *       - profile
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Successful operation. Returns the user's reels.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve reels.
 */
router
  .route('/:username/reels')
  .get(
    authController.requireAuth,
    usernameParamsValidation,
    validateRequest,
    usersController.getUserReels
  );

export { router as usersRouter };
