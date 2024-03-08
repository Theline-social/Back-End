import { catchAsync } from '../common';
import { TagsService } from '../services/tag.service';
import { Request, Response, NextFunction } from 'express';

const tagsService = new TagsService();

export const getTrendingTags = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { page, limit } = req.query;

    const { tags } = await tagsService.getTrendingTags(
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { tags },
    });
  }
);

export const searchTags = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { page, limit, tag } = req.query;

    const { tags } = await tagsService.search(
      tag as string,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { tags },
    });
  }
);
