import express, { Router } from 'express';
import * as jobsController from '../controllers/job.controller';
import * as tweetsController from '../controllers/tweet.controller';
import * as authController from '../controllers/auth.controller';
import {
  AddJobValidationRules,
  jobIdParamsValidation,
  validateRequest,
} from '../common';
import { SubscriptionType } from '../entities';

const router: Router = express.Router();

/**
 * @swagger
 * /jobs/add-job:
 *   post:
 *     summary: Add a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               topic:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               requiredApplicantsCount:
 *                 type: integer
 *               jobDurationInDays:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Job added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

router
  .route('/add-job')
  .post(
    authController.requireAuth,
    authController.strictUserTo(SubscriptionType.BUSINESS),
    tweetsController.uploadTweetMedia,
    tweetsController.processTweetMedia,
    AddJobValidationRules,
    validateRequest,
    jobsController.addJob
  );


  /**
 * @swagger
 * /jobs/timeline:
 *   get:
 *     summary: Get timeline jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of timeline jobs
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router
  .route('/timeline')
  .get(authController.requireAuth, jobsController.getTimelineJobs);


  /**
 * @swagger
 * /jobs/{jobId}/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully applied for the job
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:jobId/apply')
  .post(
    authController.requireAuth,
    authController.strictUserTo(
      SubscriptionType.INTERESTED,
      SubscriptionType.PROFESSIONAL
    ),
    jobIdParamsValidation,
    validateRequest,
    jobsController.applyForJob
  );

  /**
 * @swagger
 * /jobs/{jobId}/applicants:
 *   get:
 *     summary: Get job applicants
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of job applicants
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

router
  .route('/:jobId/applicants')
  .get(
    authController.requireAuth,
    authController.strictUserTo(
      SubscriptionType.BUSINESS,
    ),
    jobIdParamsValidation,
    validateRequest,
    jobsController.getJobApplicants
  );


  /**
 * @swagger
 * /jobs/{jobId}/toggleBookmark:
 *   patch:
 *     summary: Toggle job bookmark status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bookmark status toggled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:jobId/toggleBookmark')
  .patch(
    authController.requireAuth,
    jobIdParamsValidation,
    validateRequest,
    jobsController.toggleBookmark
  );

export { router as jobsRouter };
