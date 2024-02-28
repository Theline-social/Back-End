import express, { Router } from 'express';
import * as tweetsController from '../controllers/tweet.controller';
import * as authController from '../controllers/auth.controller';

import { addPollValidationRules, validateRequest } from '../common';
import { replyIdParamsValidation, tweetIdParamsValidation } from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /tweets/add-tweet:
 *   post:
 *     summary: Add a new tweet
 *     description: Add a new tweet with content and optional images.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: content
 *         in: formData
 *         description: The content of the tweet.
 *         required: true
 *         type: string
 *       - name: images
 *         in: formData
 *         description: List of image files to be attached to the tweet.
 *         required: false
 *         type: array
 *         items:
 *           type: file
 *     responses:
 *       '200':
 *         description: OK. Tweet successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to add the tweet.
 */

router
  .route('/add-tweet')
  .post(
    authController.requireAuth,
    tweetsController.uploadTweetMedia,
    tweetsController.processTweetMedia,
    tweetsController.addTweet
  );

/**
 * @swagger
 *  /tweets/add-poll:
 *   post:
 *     summary: Add a new poll
 *     tags:
 *       - tweets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               length:
 *                 type: string 
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Poll added successfully
 *       '401':
 *         description: Unauthorized, user not logged in
 *       '422':
 *         description: Validation failed
 */
router
  .route('/add-poll')
  .post(
    authController.requireAuth,
    addPollValidationRules,
    validateRequest,
    tweetsController.addPoll
  );

/**
 * @swagger
 * /tweets/{tweetId}/toggle-vote:
 *   patch:
 *     summary: Toggle vote on a tweet
 *     description: Toggles the user's vote (like/dislike) on a specific tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         description: The ID of the tweet.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               optionIdx:
 *                 type: string

 *     responses:
 *       '200':
 *         description: OK. Vote on the tweet successfully toggled.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Tweet not found.
 *       '500':
 *         description: Internal Server Error. Failed to toggle vote on the tweet.
 */
router
  .route('/:tweetId/toggle-vote')
  .patch(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.toggleVote
  );

/**
 * @swagger
 * /tweets/{tweetId}:
 *   delete:
 *     summary: Delete a tweet
 *     description: Delete a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No content. Tweet successfully deleted.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to delete the tweet.
 */

router
  .route('/:tweetId')
  .delete(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.deleteTweet
  );

/**
 * @swagger
 * /tweets/{tweetId}/replies:
 *   get:
 *     summary: Get replies to a tweet
 *     description: Retrieves replies to a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to get replies for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Replies to the tweet successfully retrieved.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve tweet replies.
 */
router
  .route('/:tweetId/replies')
  .get(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.getTweetReplies
  );

/**
 * @swagger
 * /tweets/{tweetId}/reacters:
 *   get:
 *     summary: Get reacters of a tweet
 *     description: Retrieves the users who reacted to a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to get reacters for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Reacters of the tweet successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve reacters of the tweet.
 */

router
  .route('/:tweetId/reacters')
  .get(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.getTweetReacters
  );

/**
 * @swagger
 * /tweets/{tweetId}/retweeters:
 *   get:
 *     summary: Get retweeters of a tweet
 *     description: Retrieves the users who retweeted a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to get retweeters for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Retweeters of the tweet successfully retrieved.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to retrieve retweeters of the tweet.
 */

router
  .route('/:tweetId/retweeters')
  .get(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.getTweetReTweeters
  );

/**
 * @swagger
 * /tweets/{tweetId}/retweets:
 *   get:
 *     summary: Get a single tweet by ID
 *     description: Retrieves a single tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
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
  .route('/:tweetId/retweets')
  .get(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.getTweetReTweets
  );
/**
 * @swagger
 * /tweets/{tweetId}:
 *   get:
 *     summary: Get a single tweet by ID
 *     description: Retrieves a single tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to retrieve.
 *         required: true
 *         schema:
 *           type: string
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
  .route('/:tweetId')
  .get(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.getTweet
  );

/**
 * @swagger
 * /tweets/{tweetId}/add-reply:
 *   post:
 *     summary: Add a reply to a tweet
 *     description: Adds a reply to a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to add a reply to.
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
 *         description: Not found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the reply.
 */

router
  .route('/:tweetId/add-reply')
  .post(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.addTweetReply
  );

/**
 * @swagger
 * /tweets/{tweetId}/toggle-react:
 *   patch:
 *     summary: Add a reaction to a tweet or remove my react if i reacted already.
 *     description: Adds a reaction to a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to add a reaction to.
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
 *         description: Not found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the reaction.
 */

router
  .route('/:tweetId/toggle-react')
  .patch(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.toggleTweetReact
  );

/**
 * @swagger
 * /tweets/{tweetId}/{replyId}/add-reply:
 *   post:
 *     summary: Add a reply to a reply of a tweet
 *     description: Adds a reply to a reply of a tweet by their IDs.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to which the reply belongs.
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
 *         description: Not found. Tweet or reply with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the reply.
 */

router
  .route('/:tweetId/:replyId/add-reply')
  .post(
    authController.requireAuth,
    tweetIdParamsValidation,
    replyIdParamsValidation,
    validateRequest,
    tweetsController.addReplyToReply
  );

/**
 * @swagger
 * /tweets/{tweetId}/{replyId}/toggle-react:
 *   patch:
 *     summary: Toggle reaction to a reply
 *     description: Toggles the reaction (add/remove) to a reply of a tweet by their IDs.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to which the reply belongs.
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
 *         description: Not found. Tweet or reply with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to toggle the reaction.
 */

router
  .route('/:tweetId/:replyId/toggle-react')
  .patch(
    authController.requireAuth,
    tweetIdParamsValidation,
    replyIdParamsValidation,
    validateRequest,
    tweetsController.toggleReplyReact
  );

/**
 * @swagger
 * /tweets/{tweetId}/retweet:
 *   post:
 *     summary: Retweet a tweet
 *     description: Retweets a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to retweet.
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
 *                 description: Content of the retweet quote.
 *             required:
 *               - quote
 *     responses:
 *       '201':
 *         description: Created. Retweet successfully added.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to add the retweet.
 */

router
  .route('/:tweetId/retweet')
  .post(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.addRetweet
  );

/**
 * @swagger
 * /tweets/{tweetId}/toggle-bookmark:
 *   patch:
 *     summary: Bookmark a tweet
 *     description: Marks a tweet as bookmarked by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to bookmark.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Tweet bookmarked successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Tweet with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to bookmark the tweet.
 */

router
  .route('/:tweetId/toggle-bookmark')
  .patch(
    authController.requireAuth,
    tweetIdParamsValidation,
    validateRequest,
    tweetsController.toggleBookmark
  );
export { router as tweetsRouter };
