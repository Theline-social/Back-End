import express, { Router } from 'express';
import * as reelsController from '../controllers/reel.controller';
import * as authController from '../controllers/auth.controller';

import { validateRequest } from '../common';
import { replyIdParamsValidation, reelIdParamsValidation } from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /reels:
 *   post:
 *     summary: Add a new reel
 *     description: Add a new reel with content and optional images.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: content
 *         in: formData
 *         description: The content of the reel.
 *         required: true
 *         type: string
 *       - name: images
 *         in: formData
 *         description: List of image files to be attached to the reel.
 *         required: false
 *         type: array
 *         items:
 *           type: file
 *     responses:
 *       '200':
 *         description: OK. Reel successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to add the reel.
 */

router
  .route('/')
  .post(
    authController.requireAuth,
    reelsController.uploadReel,
    reelsController.saveReel,
    reelsController.addReel
  );

/**
 * @swagger
 * /reels/{reelId}:
 *   delete:
 *     summary: Delete a reel
 *     description: Delete a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No content. Reel successfully deleted.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to delete the reel.
 */

router
  .route('/:reelId')
  .delete(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.deleteReel
  );

/**
 * @swagger
 * /reels/{reelId}/replies:
 *   get:
 *     summary: Get replies to a reel
 *     description: Retrieves replies to a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to get replies for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Replies to the reel successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve reel replies.
 */
router
  .route('/:reelId/replies')
  .get(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.getReelReplies
  );

/**
 * @swagger
 * /reels/{reelId}/reacters:
 *   get:
 *     summary: Get reacters of a reel
 *     description: Retrieves the users who reacted to a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to get reacters for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Reacters of the reel successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve reacters of the reel.
 */

router
  .route('/:reelId/reacters')
  .get(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.getReelReacters
  );
  
/**
 * @swagger
 * /reels/{reelId}/rereelers:
 *   get:
 *     summary: Get rereelers of a reel
 *     description: Retrieves the users who rereeled a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to get rereelers for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Rereelers of the reel successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve rereelers of the reel.
 */

router
  .route('/:reelId/rereelers')
  .get(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.getReelReReelers
  );
/**
 * @swagger
 * /reels/{reelId}:
 *   get:
 *     summary: Get a single reel by ID
 *     description: Retrieves a single reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Reel successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve the reel.
 */

router
  .route('/:reelId')
  .get(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.getReel
  );

/**
 * @swagger
 * /reels/{reelId}/add-reply:
 *   post:
 *     summary: Add a reply to a reel
 *     description: Adds a reply to a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to add a reply to.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the reply.
 *     responses:
 *       '201':
 *         description: Created. Reply successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the reply.
 */

router
  .route('/:reelId/add-reply')
  .post(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.addReelReply
  );

/**
 * @swagger
 * /reels/{reelId}/toggle-react:
 *   patch:
 *     summary: Add a reaction to a reel or remove my react if i reacted already.
 *     description: Adds a reaction to a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to add a reaction to.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Created. Reaction successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the reaction.
 */

router
  .route('/:reelId/toggle-react')
  .patch(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.toggleReelReact
  );

/**
 * @swagger
 * /reels/{reelId}/{replyId}/add-reply:
 *   post:
 *     summary: Add a reply to a reply of a reel
 *     description: Adds a reply to a reply of a reel by their IDs.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to which the reply belongs.
 *         required: true
 *         schema:
 *           type: string
 *       - name: replyId
 *         in: path
 *         description: ID of the reply to which a new reply will be added.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the reply.
 *             required:
 *               - content
 *     responses:
 *       '201':
 *         description: Created. Reply successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel or reply with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the reply.
 */

router
  .route('/:reelId/:replyId/add-reply')
  .post(
    authController.requireAuth,
    reelIdParamsValidation,
    replyIdParamsValidation,
    validateRequest,
    reelsController.addReplyToReply
  );

/**
 * @swagger
 * /reels/{reelId}/{replyId}/toggle-react:
 *   patch:
 *     summary: Toggle reaction to a reply
 *     description: Toggles the reaction (add/remove) to a reply of a reel by their IDs.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to which the reply belongs.
 *         required: true
 *         schema:
 *           type: string
 *       - name: replyId
 *         in: path
 *         description: ID of the reply to toggle the reaction.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Reaction toggled successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel or reply with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to toggle the reaction.
 */

router
  .route('/:reelId/:replyId/toggle-react')
  .patch(
    authController.requireAuth,
    reelIdParamsValidation,
    replyIdParamsValidation,
    validateRequest,
    reelsController.toggleReplyReact
  );

/**
 * @swagger
 * /reels/{reelId}/rereel:
 *   post:
 *     summary: Rereel a reel
 *     description: Rereels a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to rereel.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quote:
 *                 type: string
 *                 description: Content of the rereel quote.
 *             required:
 *               - quote
 *     responses:
 *       '201':
 *         description: Created. Rereel successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the rereel.
 */

router
  .route('/:reelId/rereel')
  .post(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.addRereel
  );

/**
 * @swagger
 * /reels/{reelId}/toggle-bookmark:
 *   patch:
 *     summary: Bookmark a reel
 *     description: Marks a reel as bookmarked by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     parameters:
 *       - name: reelId
 *         in: path
 *         description: ID of the reel to bookmark.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Reel bookmarked successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to bookmark the reel.
 */

router
  .route('/:reelId/toggle-bookmark')
  .patch(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.toggleBookmark
  );
export { router as reelsRouter };
