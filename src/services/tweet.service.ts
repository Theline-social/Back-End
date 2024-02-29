import { In } from 'typeorm';
import { AppError, options, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import { CronJob } from 'cron';

import {
  Retweet,
  Tweet,
  TweetMention,
  TweetReply,
  TweetReplyMention,
  User,
} from '../entities';
import socketService from './socket.service';
import { Poll, PollOption } from '../entities/Poll';

export class TweetsService {
  constructor() {}

  getTweets = async () => {};

  addTweet = async (
    userId: number,
    body: { content: string; imageUrls: string[]; gifUrl: string }
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);

    if (!body.content && !body.imageUrls && !body.gifUrl)
      throw new AppError('Must provide content or images', 400);

    const user = await userRepository.findOne({
      where: { userId },
      relations: { tweets: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const tweet = new Tweet();
    tweet.content = body.content;
    tweet.imageUrls = body.imageUrls || [];
    tweet.gifUrl = body.gifUrl || '';
    tweet.tweeter = user;

    try {
      await tweetRepository.save(tweet);
      console.log('Tweet scheduled successfully.');

      let usernames =
        (body.content.match(usernameRegex) as Array<string>) || [];

      if (!usernames) return { tweet };

      usernames = usernames.map((username) => username.replace('@', ''));

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
    } catch (error) {
      console.error('Error scheduling tweet:', error);
    }

    return { tweet };
  };

  addPoll = async (
    userId: number,
    body: { question: string; options: string[]; length: Date }
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const poll = new Poll();
    poll.question = body.question;
    poll.length = body.length;

    poll.options = body.options.map((option) => {
      const pollOption = new PollOption();
      pollOption.text = option;

      return pollOption;
    });

    const user = new User();
    user.userId = userId;

    const tweet = new Tweet();
    tweet.poll = poll;
    tweet.tweeter = user;

    await tweetRepository.save(tweet);
  };

  toggleVote = async (
    userId: number,
    tweetId: number,
    body: { optionIdx: number }
  ) => {
    const pollRepository = AppDataSource.getRepository(Poll);

    if (!body.optionIdx) throw new AppError('option index is required', 400);

    const poll = await pollRepository.findOne({
      where: { tweet: { tweetId } },
    });

    if (!poll) throw new AppError('Poll not found', 404);

    const user = new User();
    user.userId = userId;

    if (poll.options.length <= body.optionIdx)
      throw new AppError('Option index out of range', 400);

    const selectedOptionVoters = poll.options[body.optionIdx].voters || [];

    const existingVoteIndex = selectedOptionVoters.findIndex(
      (voter) => voter.userId === userId
    );

    if (existingVoteIndex !== -1) {
      selectedOptionVoters.splice(existingVoteIndex, 1);
    } else {
      selectedOptionVoters.push(user);
    }

    poll.options[body.optionIdx].voters = selectedOptionVoters;
    await pollRepository.save(poll);
  };

  exists = async (id: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    return await tweetRepository.exists({ where: { tweetId: id } });
  };

  deleteTweet = async (id: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    await tweetRepository.delete(id);
  };

  getTweetReplies = async (userId: number, tweetId: number) => {
    const tweetReplyRepository = AppDataSource.getRepository(TweetReply);

    const replies = await tweetReplyRepository.find({
      where: { tweet: { tweetId } },
      select: {
        mentions: {
          mentionedAt: true,
          userMentioned: { username: true },
        },
        reacts: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: { replies: { replies: true }, reacts: true, mentions: true },
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
        retweeter: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: { retweeter: true },
    });

    return {
      retweeters: retweets.map((retweet) => retweet.retweeter),
    };
  };

  getTweetReTweets = async (id: number) => {
    const retweetRepository = AppDataSource.getRepository(Retweet);

    const retweets = await retweetRepository.find({
      where: { tweet: { tweetId: id } },
      select: {
        retweeter: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
        tweet: {
          tweeter: {
            email: true,
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
          },
          mentions: {
            mentionedAt: true,
            userMentioned: { username: true },
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
      },
      relations: {
        retweeter: true,
        tweet: {
          replies: true,
          reacts: true,
          tweeter: true,
          retweets: true,
          bookmarkedBy: true,
          mentions: { userMentioned: true },
        },
      },
    });

    return {
      retweets,
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
          userId: true,
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
        imageUrls: true,
        tweetId: true,
        gifUrl: true,
        content: true,
        createdAt: true,
        tweeter: {
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
          bio: true,
        },
        mentions: {
          mentionedAt: true,
          userMentioned: { username: true },
        },
        reacts: {
          userId: true,
        },
        bookmarkedBy: {
          userId: true,
        },
        retweets: true,
        poll: {
          options: {
            voters: {
              email: true,
              username: true,
              jobtitle: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },

      relations: {
        replies: true,
        reacts: true,
        tweeter: { followers: true, following: true, blocked: true, muted: true },
        retweets: { retweeter: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
        poll: { options: { voters: true } },
      },
    });

    if (!tweet) throw new AppError(`No tweet found`, 400);

    const isBookmarked = tweet.bookmarkedBy.some(
      (user: User) => user.userId === userId
    );
    const isReacted = tweet.reacts.some((user: User) => user.userId === userId);
    const isBlocked = tweet.tweeter.blocked.some(
      (user: User) => user.userId === userId
    );
    const isMuted = tweet.tweeter.muted.some(
      (user: User) => user.userId === userId
    );
    const isRetweeted = tweet.retweets.some(
      (retweet: Retweet) => retweet.retweeter.userId === userId
    );

    return {
      tweet: {
        tweetId,
        gifUrl: tweet.gifUrl,
        imageUrls: tweet.imageUrls,
        content: tweet.content,
        createdAt: tweet.createdAt,
        tweeter: {
          imageUrl: tweet.tweeter.imageUrl,
          username: tweet.tweeter.username,
          jobtitle: tweet.tweeter.jobtitle,
          name: tweet.tweeter.name,
          followersCount: tweet.tweeter.followers.length,
          followingsCount: tweet.tweeter.following.length,
          isMuted,
          isBlocked,
        },
        mentions: tweet.mentions
          ? tweet.mentions.map((mention) => {
              return mention.userMentioned.username;
            })
          : [],
        reactCount: tweet.reactCount,
        reTweetCount: tweet.reTweetCount,
        repliesCount: tweet.repliesCount,
        votesCount: tweet.poll?.totalVoters,
        isBookmarked,
        isReacted,
        isRetweeted,
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
      usernames = usernames.map((username) => username.replace('@', ''));

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
      usernames = usernames.map((username) => username.replace('@', ''));

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
    retweet.retweeter = user;
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
