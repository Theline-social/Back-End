import express, { Router } from 'express';
import * as usersController from '../controllers/user.controller';
import * as authController from '../controllers/auth.controller';

import { validateRequest } from '../common';
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
 * /upload-photo-profile:
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
  .route('/upload-photo-profile')
  .post(
    authController.requireAuth,
    usersController.uploadPhoto,
    usersController.resizePhoto
  );

export { router as usersRouter };
