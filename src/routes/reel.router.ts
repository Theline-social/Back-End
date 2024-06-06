import express, { Router } from 'express';
import * as reelsController from '../controllers/reel.controller';
import * as authController from '../controllers/auth.controller';

import { validatePagination, validateRequest } from '../common';
import { replyIdParamsValidation, reelIdParamsValidation } from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /reels/timeline:
 *   get:
 *     summary: Get timeline reels
 *     description: Retrieve timeline tweets with pagination
 *     tags:
 *       - reels
 *     security:
 *       - bearerAuth: []
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
 *         description: Successful operation
 *       '400':
 *         description: Invalid request parameters
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '500':
 *         description: Internal server error
 */

router
  .route('/timeline')
  .get(
    authController.requireAuth,
    validatePagination,
    validateRequest,
    reelsController.getTimelineReels
  );

/**
 * @swagger
 * /reels/add-reel:
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
 *       - name: topics
 *         in: formData
 *         description: List of topics related to the reel.
 *         required: false
 *         type: array
 *         items:
 *           type: string
 *       - name: reel
 *         in: formData
 *         description: List of image files to be attached to the reel.
 *         required: false
 *         type: file
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
  .route('/add-reel')
  .post(
    authController.requireAuth,
    reelsController.uploadReel,
    reelsController.processReelMedia,
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

/**
 * @swagger
 * /reels/{reelId}/rereels:
 *   get:
 *     summary: Get a rereels of a reel
 *     description: Retrieves a single tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
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
 *       - name: reelId
 *         in: path
 *         description: ID of the tweet to retrieve.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Tweet successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve the tweet.
 */
router
  .route('/:reelId/rereels')
  .get(
    authController.requireAuth,
    reelIdParamsValidation,
    validateRequest,
    reelsController.getReelReReels
  );

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
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: reelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reel to which the reply will be added.
 *       - in: body
 *         name: requestBody
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *               description: The content of the reel.
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
 * /reels/{reelId}/rereel:
 *   post:
 *     summary: Rereel a reel
 *     description: Rereels a reel by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - reels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
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

/**
 * @swagger
 * /reels/supporting/{tag}:
 *   get:
 *     summary: Retrieve reels supporting a specific tag
 *     tags:
 *       - reels
 *     description: |
 *       This endpoint retrieves reels that support a specific tag.
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
 *       - in: path
 *         name: tag
 *         required: true
 *         description: The tag for which reels are to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Reels fetched successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to get the reels.
 */
router
  .route('/supporting/:tag')
  .get(authController.requireAuth, reelsController.getReelsSupportingTag);

export { router as reelsRouter };
