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

      req.body.imagesUrl = imageUrls;
    }

    const gif = (req.files as Record<string, any>)[
      'gif'
    ] as Express.Multer.File;

    if (gif) {
      const fileName = `/tweets/gif-${Date.now()}`;

      await sharp(gif.buffer)
        .toFormat('gif')
        .toFile(
          process.env.NODE_ENV !== 'production'
            ? `F:/MyRepos/Back-End-SM-Mostaql/assets/tweets/gif-${fileName}.gif`
            : `/home/TheLine/Back-End/assets/tweets/gif-${fileName}.gif`
        );

      req.body.gifUrl = `/tweets/gif-${fileName}.gif`;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const addTweet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await tweetsService.addTweet(userId, req.body);

    res.status(201).json({
      status: true,
      message: 'Tweet added successfully',
    });
  }
);

export const addPoll = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await tweetsService.addPoll(userId, req.body);

    res.status(201).json({
      status: true,
      message: 'Poll added successfully',
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
    const { retweeters } = await tweetsService.getTweetReTweeters(
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
    const { reacters } = await tweetsService.getTweetReacters(
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
    const { retweets } = await tweetsService.getTweetReTweets(
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
      message: 'React added successfully',
    });
  }
);

export const addReplyToReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await tweetsService.addReplyToReply(
      Number(userId),
      Number(req.params.tweetId),
      Number(req.params.replyId),
      req.body
    );

    res.status(200).json({
      status: true,
      message: 'Reply added successfully',
    });
  }
);

export const toggleReplyReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    await tweetsService.toggleReplyReact(
      +userId,
      +req.params.tweetId,
      +req.params.replyId
    );

    res.status(200).json({
      status: true,
      message: 'Reply react added successfully',
    });
  }
);

export const addRetweet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { retweet } = await tweetsService.addRetweet(
      Number(userId),
      Number(req.params.tweetId),
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
