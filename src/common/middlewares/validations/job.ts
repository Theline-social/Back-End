import { body, param } from 'express-validator';
import { JobService } from '../../../services/job.service';

const jobService = new JobService();

export const jobIdParamsValidation = [
  param('jobId')
    .exists()
    .toInt()
    .custom(async (id) => {
      const exists = await jobService.exists(id);
      if (!exists) {
        throw new Error('job Id  does not exist');
      }
    }),
];

export const AddJobValidationRules = [
  body('description')
    .isString()
    .notEmpty()
    .withMessage('description is required'),
  body('topic').isString().notEmpty().withMessage('topic is required'),
  body('jobDurationInDays')
    .isString()
    .notEmpty()
    .withMessage('jobDurationInDays is required'),
  body('requiredApplicantsCount')
    .isString()
    .notEmpty()
    .withMessage('requiredApplicantsCount is required'),
];
