import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../common';

import { TopicsService } from '../services/topics.service';

const topicsService = new TopicsService();

export const addTopic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await topicsService.addTopic(req.body);

    res.status(200).json({
      status: true,
      messgae: `topic added successfully`,
    });
  }
);

export const deleteTopic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await topicsService.deleteTopic(+req.params.topicId);

    res.status(200).json({
      status: true,
      messgae: `topic added successfully`,
    });
  }
);

export const getTopicReels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;
    const lang = req.headers['accept-language'] as string;

    const { page, limit } = req.query;

    const { supportingreels } = await topicsService.getTopicReels(
      userId,
      req.params.topic,
      lang,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { supportingreels },
    });
  }
);

export const getTopicJobs = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = res.locals.currentUser.userId;
      const lang = req.headers['accept-language'] as string;
  
      const { page, limit } = req.query;
  
      const { jobs } = await topicsService.getTopicJobs(
        userId,
        req.params.topic,
        lang,
        +(page as string) || 1,
        +(limit as string) || 10
      );
  
      res.status(200).json({
        status: true,
        data: { jobs },
      });
    }
  );

export const getTopics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lang = req.headers['accept-language'] as string;

    const { topics } = await topicsService.getTopics(lang);

    res.status(200).json({
      status: true,
      data: { topics },
    });
  }
);
