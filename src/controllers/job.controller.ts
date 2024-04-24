import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../common';

import { JobService } from '../services/job.service';

const jobService = new JobService();



export const addJob = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const lang = req.headers['accept-language'] as string;

    const { job } = await jobService.addJob(userId, req.body, lang);

    res.status(200).json({
      status: true,
      data: { job },
    });
  }
);

export const applyForJob = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await jobService.applyForJob(userId, +req.params.jobId);

    res.status(200).json({
      status: true,
      message: 'Job applied successfully',
    });
  }
);

export const getJobApplicants = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    let { page, limit } = req.query;

    const { currentPage, totalPages, applicants } =
      await jobService.getJobApplicants(
        userId,
        +req.params.jobId,
        +(page as string) || 1,
        +(limit as string) || 10
      );

    res.status(200).json({
      status: true,
      data: { currentPage, totalPages, applicants },
    });
  }
);

export const getTimelineJobs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const lang = req.headers['accept-language'] as string;

    let { page, limit } = req.query;

    const { timelineJobs } = await jobService.getTimelineJobs(
      userId,
      +(page as string) || 1,
      +(limit as string) || 10,
      lang
    );

    res.status(200).json({
      status: true,
      data: { timelineJobs },
    });
  }
);

export const toggleBookmark = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await jobService.toggleBookmark(userId, +req.params.jobId);

    res.status(200).json({
      status: true,
      message: 'Bookmark toggled successfully',
    });
  }
);
