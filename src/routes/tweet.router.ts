import express, { Router } from 'express';
import * as tweetsController from '../controllers/tweet.controller';
import * as authController from '../controllers/auth.controller';

import {
  addPollValidationRules,
  optionIdParamsValidation,
  pollIdParamsValidation,
  validatePagination,
  validateRequest,
} from '../common';
import { replyIdParamsValidation, tweetIdParamsValidation } from '../common';
import { TweetsService } from '../services/tweet.service';

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
 *       - name: gif
 *         in: formData
 *         description: List of image gifs to be attached to the tweet.
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
 * /tweets/timeline:
 *   get:
 *     summary: Get timeline tweets
 *     description: Retrieve timeline tweets with pagination
 *     tags:
 *       - tweets
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
    tweetsController.getTimelineTweets
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
 * /tweets/{pollId}/toggle-vote/{optionId}:
 *   patch:
 *     summary: Toggle vote on a tweet
 *     description: Toggles the user's vote (like/dislike) on a specific tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     parameters:
 *       - in: path
 *         name: pollId
 *         description: The ID of the poll.
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: optionId
 *         description: The ID of the option.
 *         required: true
 *         schema:
 *           type: integer
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
  .route('/:pollId/toggle-vote/:optionId')
  .patch(
    authController.requireAuth,
    pollIdParamsValidation,
    optionIdParamsValidation,
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
 * /tweets/{tweetId}/quotes:
 *   get:
 *     summary: Get a single tweet by ID
 *     description: Retrieves a single tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
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
  .route('/:tweetId/quotes')
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
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to add a reply to.
 *         required: true
 *         schema:
 *           type: string
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
 *       - name: gif
 *         in: formData
 *         description: List of image gifs to be attached to the tweet.
 *         required: false
 *         type: array
 *         items:
 *           type: file
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
    tweetsController.uploadTweetMedia,
    tweetsController.processTweetMedia,
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
 * /tweets/{tweetId}/retweet:
 *   post:
 *     summary: Retweet a tweet
 *     description: Retweets a tweet by its ID.
 *     security:
 *       - jwt: []
 *     tags:
 *       - tweets
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: tweetId
 *         in: path
 *         description: ID of the tweet to retweet.
 *         required: true
 *         schema:
 *           type: string
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
 *       - name: gif
 *         in: formData
 *         description: List of image gifs to be attached to the tweet.
 *         required: false
 *         type: array
 *         items:
 *           type: file
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
    tweetsController.uploadTweetMedia,
    tweetsController.processTweetMedia,
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


  /**
 * @swagger
 * /tweets/supporting/{tag}:
 *   get:
 *     summary: Retrieve tweets supporting a specific tag
 *     tags:
 *       - tweets
 *     description: |
 *       This endpoint retrieves tweets that support a specific tag.
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
 *         description: The tag for which tweets are to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Tweets  fetched successfully.
 *       '400':
 *         description: Bad Request. Invalid request parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '404':
 *         description: Not Found. Reel with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Failed to get the tweets.
 */
router
  .route('/supporting/:tag')
  .get(authController.requireAuth, tweetsController.getTweetsSupportingTag);

export { router as tweetsRouter };
