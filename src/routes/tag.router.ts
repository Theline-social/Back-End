import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as tagsController from '../controllers/tag.controller';

import { validatePagination, validateRequest } from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /tags/trending:
 *   get:
 *     summary: Get trending tags.
 *     description: Retrieves trending tags sorted by popularity.
 *     tags: [trending tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination.
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The maximum number of tags per page.
 *         required: false
 *     responses:
 *       '200':
 *         description: Successful operation. Returns the search results.
 *       '400':
 *         description: Bad Request. Invalid query parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to search tags.
 */

router
  .route('/trending')
  .get(
    authController.requireAuth,
    validatePagination,
    validateRequest,
    tagsController.getTrendingTags
  );

/**
 * @swagger
 * /tags/search:
 *   get:
 *     summary: Search for tags
 *     description: Search for tags based on the provided query parameters.
 *     tags:
 *       - search
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of results per page.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: tag
 *         in: query
 *         description: Tag to search for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation. Returns the search results.
 *       '400':
 *         description: Bad Request. Invalid query parameters.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to search tags.
 */
router
  .route('/search')
  .get(
    authController.requireAuth,
    validatePagination,
    validateRequest,
    tagsController.searchTags
  );

export { router as tagsRouter };
