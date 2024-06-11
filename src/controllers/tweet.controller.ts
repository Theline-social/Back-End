import multer from 'multer';
import sharp from 'sharp';

import { AppError, IStorage, catchAsync } from '../common';
import { Request, Response, NextFunction } from 'express';
import { TweetsService } from '../services/tweet.service';
import { fileFilter } from './user.controller';

import BackblazeStorage from '../common/storage/BackblazeStorage';
import LocalStorage from '../common/storage/LocalStorage';

const tweetsService = new TweetsService();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage, fileFilter: fileFilter });

export const uploadTweetMedia = upload.fields([
  { name: 'images', maxCount: 4 },
  { name: 'gif', maxCount: 1 },
]);

const storageService: IStorage =
  process.env.NODE_ENV === 'production'
    ? BackblazeStorage.getInstance()
    : LocalStorage.getInstance();

export const processTweetMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files) return next();

  try {
    const images = (req.files as Record<string, any>)[
      'images'
    ] as Express.Multer.File[];
    const gifs = (req.files as Record<string, any>)[
      'gif'
    ] as Express.Multer.File[];

    if (images) {
      const imageUrls: string[] = [];

      await Promise.all(
        images.map(async (image: Express.Multer.File, i: number) => {
          const imageUrl = await storageService.processAndUploadImage(
            image.buffer,
          );

          imageUrls.push(imageUrl);
        })
      );

      req.body.imageUrls = imageUrls;
    }

    if (gifs) {
      const gifUrl = await storageService.processAndUploadGif(
        gifs[0].buffer,
      );
      req.body.gifUrl = gifUrl;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const addTweet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { tweet } = await tweetsService.addTweet(userId, req.body);

    res.status(201).json({
      status: true,
      message: 'Tweet added successfully',
      data: { tweet },
    });
  }
);

export const getTimelineTweets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { timelineTweets } = await tweetsService.getTimelineTweets(
      userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(201).json({
      status: true,
      message: 'Tweets fetched successfully',
      data: { timelineTweets },
    });
  }
);

export const addPoll = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { tweet } = await tweetsService.addPoll(userId, req.body);

    res.status(201).json({
      status: true,
      message: 'Poll added successfully',
      data: { tweet },
    });
  }
);

export const toggleVote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await tweetsService.toggleVote(
      userId,
      +req.params.pollId,
      +req.params.optionId
    );

    res.status(201).json({
      status: true,
      message: 'vote toggled successfully',
    });
  }
);

export const deleteTweet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await tweetsService.deleteTweet(+req.params.tweetId);

    res.status(200).json({
      status: true,
      message: 'Tweet deleted successfully',
    });
  }
);

export const getTweetReplies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { replies } = await tweetsService.getTweetReplies(
      +userId,
      +req.params.tweetId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { replies },
    });
  }
);

export const getTweetReTweeters = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { retweeters } = await tweetsService.getTweetReTweeters(
      +userId,
      +req.params.tweetId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { retweeters },
    });
  }
);

export const getTweetReacters = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { reacters } = await tweetsService.getTweetReacters(
      +userId,
      +req.params.tweetId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { reacters },
    });
  }
);

export const getTweetReTweets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { retweets } = await tweetsService.getTweetReTweets(
      +userId,
      +req.params.tweetId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { retweets },
    });
  }
);

export const getTweet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { tweet } = await tweetsService.getTweet(
      +userId,
      +req.params.tweetId
    );

    res.status(200).json({
      status: true,
      data: {
        tweet,
      },
    });
  }
);

export const addTweetReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { tweetReply } = await tweetsService.addTweetReply(
      +userId,
      +req.params.tweetId,
      req.body
    );

    res.status(200).json({
      status: true,
      message: 'Tweet reply added successfully',
      data: { tweetReply },
    });
  }
);

export const toggleTweetReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await tweetsService.toggleTweetReact(+userId, +req.params.tweetId);

    res.status(200).json({
      status: true,
      message: 'React toggled successfully',
    });
  }
);

export const addRetweet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { retweet, message } = await tweetsService.addRetweet(
      +userId,
      +req.params.tweetId,
      req.body
    );

    res.status(200).json({
      status: true,
      message,
      data: { retweet },
    });
  }
);

export const toggleBookmark = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await tweetsService.toggleBookmark(+userId, +req.params.tweetId);

    res.status(200).json({
      status: true,
      message: 'tweet bookmark toggled successfully',
    });
  }
);

export const getTweetsSupportingTag = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;
    const { tweets } = await tweetsService.getTweetsSupportingTag(
      +userId,
      req.params.tag,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { tweets },
    });
  }
);
