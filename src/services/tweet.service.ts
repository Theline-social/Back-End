import { In } from 'typeorm';
import { AppError, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import {
  Retweet,
  Tweet,
  TweetMention,
  TweetReply,
  TweetReplyMention,
  User,
} from '../entities';
import socketService from './socket.service';

export class TweetsService {
  constructor() {}

  getTweets = async () => {};

  addTweet = async (
    userId: number,
    imageUrls: string[] = [],
    body: { content: string }
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);

    const user = await userRepository.findOne({
      where: { userId },
      relations: { tweets: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const tweet = new Tweet();
    tweet.content = body.content;
    tweet.imageUrls = imageUrls;
    tweet.tweeter = user;

    await tweetRepository.save(tweet);

    user.tweets.push(tweet);
    await userRepository.save(user);

    let usernames = (body.content.match(usernameRegex) as Array<string>) || [];

    if (!usernames) return;

    const users = await userRepository.find({
      where: { username: In([...usernames]) },
    });

    let tweetMentions: TweetMention[] = [];

    tweetMentions = users.map((mentioned) => {
      let newTweetMention = new TweetMention();

      newTweetMention.tweet = tweet;
      newTweetMention.userMakingMention = user;
      newTweetMention.userMentioned = mentioned;

      return newTweetMention;
    });

    await tweetMentionRepository.insert(tweetMentions);

    // for (const username of usernames) {
    //   await socketService.emitNotification(userId, username, 'MENTION', {
    //     tweetId: tweet.tweetId,
    //   });
    // }
  };

  async exists(id: number) {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    return await tweetRepository.exists({ where: { tweetId: id } });
  }

  deleteTweet = async (id: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    await tweetRepository.delete(id);
  };

  getTweetReplies = async (userId: number, tweetId: number) => {
    const tweetReplyRepository = AppDataSource.getRepository(TweetReply);

    const replies = await tweetReplyRepository.find({
      where: { tweet: { tweetId } },
      relations: { replies: true, reacts: true },
    });

    return {
      replies: replies.map((reply) => {
        const isReacted = reply.reacts.some(
          (user: User) => user.userId === userId
        );
        return {
          ...reply,
          isReacted,
          reactCount: reply.reacts.length,
        };
      }),
    };
  };

  getTweetReTweeters = async (id: number) => {
    const retweetRepository = AppDataSource.getRepository(Retweet);

    const retweets = await retweetRepository.find({
      where: { tweet: { tweetId: id } },
      select: {
        user: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
        },
      },
      relations: { user: true },
    });

    return {
      retweeters: retweets.map((retweet) => retweet.user),
    };
  };

  getTweetReacters = async (id: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweets = await tweetRepository.findOne({
      where: { tweetId: id },
      select: {
        reacts: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
        },
      },
      relations: { reacts: true },
    });

    return {
      reacters: tweets?.reacts,
    };
  };

  getTweet = async (userId: number, tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweet = await tweetRepository.findOne({
      where: { tweetId },
      select: {
        tweeter: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
        },

        replies: true,
        reacts: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
        },
        bookmarkedBy: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
        },
        retweets: true,
      },
      relations: {
        replies: { replies: true },
        reacts: true,
        tweeter: true,
        retweets: true,
        bookmarkedBy: true,
      },
    });

    if (!tweet) throw new AppError(`No tweet found`, 400);

    const isBookmarked = tweet.bookmarkedBy.some(
      (user: User) => user.userId === userId
    );

    const isReacted = tweet.reacts.some((user: User) => user.userId === userId);

    return {
      tweet: {
        ...tweet,
        reactCount: tweet?.reactCount,
        reTweetCount: tweet?.reTweetCount,
        bookmarksCount: tweet?.bookmarksCount,
        repliesCount: tweet?.repliesCount,
        isBookmarked,
        isReacted,
      },
    };
  };

  addTweetReply = async (
    userId: number,
    tweetId: number,
    body: { content: string }
  ) => {
    const tweetReplyRepository = AppDataSource.getRepository(TweetReply);
    const userRepository = AppDataSource.getRepository(User);
    const tweetReplyMentionRepository =
      AppDataSource.getRepository(TweetReplyMention);

    let tweet = new Tweet();
    tweet.tweetId = tweetId;

    let user = new User();
    user.userId = userId;

    const tweetReply = new TweetReply();
    tweetReply.content = body.content;
    tweetReply.user = user;
    tweetReply.tweet = tweet;

    await tweetReplyRepository.save(tweetReply);

    let usernames = (body.content.match(usernameRegex) as Array<string>) || [];

    if (usernames) {
      const users = await userRepository.find({
        where: { username: In([...usernames]) },
      });

      let replyMentions: TweetReplyMention[] = [];

      replyMentions = users.map((mentioned) => {
        let newTweetMention = new TweetReplyMention();

        newTweetMention.reply = tweetReply;
        newTweetMention.userMakingMention = user;
        newTweetMention.userMentioned = mentioned;
        return newTweetMention;
      });

      await tweetReplyMentionRepository.insert(replyMentions);
    }
    return { tweetReply };
  };

  toggleTweetReact = async (userId: number, tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweet = await tweetRepository.findOne({
      where: { tweetId },
      relations: ['reacts'],
    });

    if (!tweet) throw new AppError('No tweet found', 404);

    const userIndex = tweet.reacts.findIndex((user) => user.userId === userId);

    if (userIndex !== -1) {
      tweet.reacts.splice(userIndex, 1);
    } else {
      let user = new User();
      user.userId = userId;
      tweet.reacts.push(user);
    }

    await tweetRepository.save(tweet);
  };

  addReplyToReply = async (
    userId: number,
    tweetId: number,
    replyTweetId: number,
    body: { content: string }
  ) => {
    const tweetReplyRepository = AppDataSource.getRepository(TweetReply);
    const userRepository = AppDataSource.getRepository(User);
    const tweetReplyMentionRepository =
      AppDataSource.getRepository(TweetReplyMention);

    const user = new User();
    user.userId = userId;

    let tweet = new Tweet();
    tweet.tweetId = tweetId;

    let parentReply = new TweetReply();
    parentReply.replyId = replyTweetId;

    const newtweetReply = new TweetReply();
    newtweetReply.content = body.content;
    newtweetReply.user = user;
    newtweetReply.tweet = tweet;
    newtweetReply.parentReply = parentReply;

    await tweetReplyRepository.save(newtweetReply);

    let usernames = (body.content.match(usernameRegex) as Array<string>) || [];

    if (usernames) {
      const users = await userRepository.find({
        where: { username: In([...usernames]) },
      });

      let replyMentions: TweetReplyMention[] = [];

      replyMentions = users.map((mentioned) => {
        let newTweetMention = new TweetReplyMention();

        newTweetMention.reply = newtweetReply;
        newTweetMention.userMakingMention = user;
        newTweetMention.userMentioned = mentioned;
        return newTweetMention;
      });

      await tweetReplyMentionRepository.insert(replyMentions);
    }
  };

  toggleReplyReact = async (
    userId: number,
    tweetId: number,
    replyId: number
  ) => {
    const tweetReplyRepository = AppDataSource.getRepository(TweetReply);

    const tweetReply = await tweetReplyRepository.findOne({
      where: { replyId },
      relations: ['reacts'],
    });

    if (!tweetReply) throw new AppError('No tweet reply found', 404);

    const userIndex = tweetReply.reacts.findIndex(
      (user) => user.userId === userId
    );

    if (userIndex !== -1) {
      tweetReply.reacts.splice(userIndex, 1);
    } else {
      let user = new User();
      user.userId = userId;
      tweetReply.reacts.push(user);
    }

    await tweetReplyRepository.save(tweetReply);
  };

  addRetweet = async (
    userId: number,
    tweetId: number,
    body: { quote: string }
  ) => {
    const retweetRepository = AppDataSource.getRepository(Retweet);

    const tweet = new Tweet();
    tweet.tweetId = tweetId;

    const user = new User();
    user.userId = userId;

    const retweet = new Retweet();
    retweet.user = user;
    retweet.tweet = tweet;
    retweet.quote = body.quote;

    await retweetRepository.save(retweet);

    return { retweet };
  };

  toggleBookmark = async (userId: number, tweetId: number) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      relations: { tweetBookmarks: true },
    });

    if (!user) throw new AppError('No user found', 404);

    const tweetIndex = user.tweetBookmarks.findIndex(
      (user) => user.tweetId === tweetId
    );

    if (tweetIndex !== -1) {
      user.tweetBookmarks.splice(tweetIndex, 1);
    } else {
      const tweet = new Tweet();
      tweet.tweetId = tweetId;
      user.tweetBookmarks.push(tweet);
    }

    await userRepository.save(user);
  };
}
