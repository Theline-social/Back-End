import multer from 'multer';
import sharp from 'sharp';

import { AppError, catchAsync } from '../common';
import { Request, Response, NextFunction } from 'express';
import { TweetsService } from '../services/tweet.service';
import { fileFilter } from './user.controller';

const tweetsService = new TweetsService();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage, fileFilter: fileFilter });

export const uploadTweetMedia = upload.fields([
  { name: 'images', maxCount: 4 },
  { name: 'gif', maxCount: 1 },
]);

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

    if (images) {
      let imageUrls: string[] = [];

      await Promise.all(
        images.map(async (image: Express.Multer.File, i: number) => {
          const fileName = `/tweets/tweet-${Date.now()}-${i + 1}.jpeg`;

          await sharp(image.buffer)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(
              process.env.NODE_ENV !== 'production'
                ? `F:/MyRepos/Back-End-SM-Mostaql/assets${fileName}`
                : `/home/TheLine/Back-End/assets${fileName}`
            );

          imageUrls.push(fileName);
        })
      );

      req.body.imageUrls = imageUrls;
    }

    const gif = (req.files as Record<string, any>)[
      'gif'
    ] as Express.Multer.File[];

    if (gif) {
      const gifUrl = `/tweets/gif-${
        Date.now() + '-' + Math.round(Math.random() * 1e9)
      }.gif`;

      await sharp(gif[0].buffer, { animated: true })
        .toFormat('gif')
        .toFile(
          process.env.NODE_ENV !== 'production'
            ? `F:/MyRepos/Back-End-SM-Mostaql/assets${gifUrl}`
            : `/home/TheLine/Back-End/assets${gifUrl}`
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
      +(page as string),
      +(limit as string)
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

    await tweetsService.toggleVote(userId, +req.params.tweetId, req.body);

    res.status(201).json({
      status: true,
      message: 'vote toggled successfully',
    });
  }
);

export const deleteTweet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await tweetsService.deleteTweet(Number(req.params.tweetId));

    res.status(200).json({
      status: true,
      message: 'Tweet deleted successfully',
    });
  }
);

export const getTweetReplies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { replies } = await tweetsService.getTweetReplies(
      +userId,
      +req.params.tweetId
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

    const { retweeters } = await tweetsService.getTweetReTweeters(
      +userId,
      +req.params.tweetId
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

    const { reacters } = await tweetsService.getTweetReacters(
      +userId,
      +req.params.tweetId
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

    const { retweets } = await tweetsService.getTweetReTweets(
      +userId,
      +req.params.tweetId
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

    const { retweet } = await tweetsService.addRetweet(
      +(userId),
      +(req.params.tweetId),
      req.body
    );

    res.status(200).json({
      status: true,
      message: 'Retweet added successfully',
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
