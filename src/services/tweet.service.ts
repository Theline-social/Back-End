import { In, Not } from 'typeorm';
import { AppError, filterTweet, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import { Poll, PollOption } from '../entities/Poll';
import { Tweet, TweetMention, TweetType, User } from '../entities';
import * as fs from 'fs';

import socketService from './socket.service';
import { TweetMedia } from '../entities/Media';
import {
  tweetRelations,
  tweetSelectOptions,
} from '../common/filters/tweets/tweetSelectOptions';

export class TweetsService {
  constructor() {}

  getTimelineTweets = async (
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: { following: { userId: true } },
      relations: { following: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const followingsIds = user.following.map((following) => following.userId);

    const tweetsOfFollowings = await tweetRepository.find({
      where: {
        tweeter: { userId: In([...followingsIds]) },
        type: In([TweetType.Tweet, TweetType.Repost, TweetType.Quote]),
      },
      select: tweetSelectOptions,
      relations: tweetRelations,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const randomTweets = await tweetRepository.find({
      where: {
        tweeter: { userId: Not(In([...followingsIds])) },
        type: In([TweetType.Tweet, TweetType.Repost, TweetType.Quote]),
      },
      select: tweetSelectOptions,
      relations: tweetRelations,
      order: {
        createdAt: 'DESC',
      },
      take: limit - tweetsOfFollowings.length,
    });

    const timelineTweets = [...tweetsOfFollowings, ...randomTweets].map(
      (tweet) => filterTweet(tweet, userId)
    );

    return { timelineTweets };
  };

  createTweet = async (
    userId: number,
    body: { content: string; imageUrls?: string[]; gifUrl?: string },
    type: TweetType = TweetType.Tweet
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);

    if (
      type !== TweetType.Repost &&
      !body.content &&
      !body.imageUrls &&
      !body.gifUrl
    )
      throw new AppError('Must provide content or media', 400);

    const user = await userRepository.findOne({
      where: { userId },
    });

    if (!user) throw new AppError('User not found', 404);

    const tweet = new Tweet();
    tweet.content = body.content;
    tweet.tweeter = user;
    tweet.type = type;

    let media: TweetMedia[] = [];
    if (body.imageUrls) {
      for (const img of body.imageUrls) {
        const newmedia = new TweetMedia();
        newmedia.url = img;
        media.push(newmedia);
      }
    }

    if (body.gifUrl) {
      const newmedia = new TweetMedia();
      newmedia.url = body.gifUrl;
      media.push(newmedia);
    }

    tweet.media = media;
    await tweetRepository.save(tweet);

    if (body.content) {
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
    }

    return { tweet };
  };

  addTweet = async (
    userId: number,
    body: { content: string; imageUrls?: string[]; gifUrl?: string }
  ) => {
    const { tweet } = await this.createTweet(userId, body);

    return {
      tweet: {
        tweetId: tweet.tweetId,
        media: tweet.media,

        content: tweet.content,
        createdAt: tweet.createdAt,
        type: tweet.type,
        poll: { ...tweet.poll, votesCount: tweet.poll?.totalVoters },
        tweeter: {
          imageUrl: tweet.tweeter.imageUrl,
          username: tweet.tweeter.username,
          jobtitle: tweet.tweeter.jobtitle,
          name: tweet.tweeter.name,
          bio: tweet.tweeter.bio,
        },
        mentions: tweet.mentions
          ? tweet.mentions.map((mention) => {
              return mention.userMentioned.username;
            })
          : [],
      },
    };
  };

  addTweetReply = async (
    userId: number,
    tweetId: number,
    body: { content: string; imageUrls: string[]; gifUrl: string }
  ) => {
    const tweetReplyRepository = AppDataSource.getRepository(Tweet);

    let originaltweet = new Tweet();
    originaltweet.tweetId = tweetId;

    let user = new User();
    user.userId = userId;
    console.log(body);

    const { tweet } = await this.createTweet(userId, body);
    tweet.replyTo = originaltweet;
    tweet.type = TweetType.Reply;

    await tweetReplyRepository.save(tweet);

    return {
      tweetReply: {
        tweetId,
        replyId: tweet.tweetId,
        media: tweet.media,

        content: tweet.content,
        createdAt: tweet.createdAt,
        poll: { ...tweet.poll, votesCount: tweet.poll?.totalVoters },
        tweeter: {
          imageUrl: tweet.tweeter.imageUrl,
          username: tweet.tweeter.username,
          jobtitle: tweet.tweeter.jobtitle,
          name: tweet.tweeter.name,
          bio: tweet.tweeter.bio,
        },
        mentions: tweet.mentions
          ? tweet.mentions.map((mention) => {
              return mention.userMentioned.username;
            })
          : [],
      },
    };
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

    return {
      tweet: {
        tweetId: tweet.tweetId,
        createdAt: tweet.createdAt,
        type: tweet.type,
        poll: tweet.poll
          ? {
              pollId: tweet.poll.pollId,
              question: tweet.poll.question,
              length: tweet.poll.length,
              options: tweet.poll.options.map((option) => ({
                optionId: option.optionId,
                text: option.text,
                votesCount: 0,
              })),
              totalVotesCount: 0,
            }
          : {},
      },
    };
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
      relations: { options: { voters: true } },
    });

    if (!poll) throw new AppError('Poll not found', 404);

    if (poll.length < new Date())
      throw new AppError('poll duration ended', 404);

    const user = new User();
    user.userId = userId;

    if (isNaN(body.optionIdx) || poll.options.length <= body.optionIdx)
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

  deleteTweet = async (tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweet = await tweetRepository.findOne({
      where: { tweetId },
      select: { media: true, tweetId: true },
    });

    if (!tweet) {
      throw new AppError('Tweet not found', 404);
    }

    if (tweet.media.length > 0) {
      tweet.media.forEach((media) => {
        process.env.NODE_ENV !== 'production'
          ? fs.unlinkSync(`${process.env.DEV_MEDIA_PATH}/tweets/${media.url}`)
          : fs.unlinkSync(`${process.env.PROD_MEDIA_PATH}/tweets/${media.url}`);
      });
    }

    await tweetRepository.delete({ tweetId });
  };

  getTweetReplies = async (userId: number, tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const replies = await tweetRepository.find({
      where: { replyTo: { tweetId } },
      select: {
        tweetId: true,
        media: true,
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
          pollId: true,
          question: true,
          length: true,
          options: {
            optionId: true,
            text: true,
            voters: {
              username: true,
              jobtitle: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
      relations: {
        replies: {
          media: true,
          bookmarkedBy: true,
          retweets: true,
          reacts: true,
          mentions: { userMentioned: true },
          tweeter: {
            muted: true,
            followers: true,
            following: true,
            blocked: true,
          },
        },
        media: true,
        reacts: true,
        tweeter: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        retweets: { tweeter: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
        poll: { options: { voters: true } },
      },
    });

    return {
      replies: replies.map((reply) => {
        return {
          tweetId,
          replyId: reply.tweetId,
          media: reply.media,
          content: reply.content,
          createdAt: reply.createdAt,
          type: TweetType.Reply,
          poll: reply.poll
            ? {
                pollId: reply.poll.pollId,
                question: reply.poll.question,
                length: reply.poll.length,
                options: reply.poll.options.map((option) => ({
                  optionId: option.optionId,
                  text: option.text,
                  votesCount: option.voters.length,
                })),
                totalVotesCount: reply.poll.totalVoters,
              }
            : {},
          replier: {
            imageUrl: reply.tweeter.imageUrl,
            username: reply.tweeter.username,
            jobtitle: reply.tweeter.jobtitle,
            name: reply.tweeter.name,
            bio: reply.tweeter.bio,
            followersCount: reply.tweeter.followers.length,
            followingsCount: reply.tweeter.following.length,
            isFollowed: reply.tweeter.followers.some(
              (user: User) => user.userId === userId
            ),
            isMuted: reply.tweeter.muted.some(
              (user: User) => user.userId === userId
            ),
            isBlocked: reply.tweeter.blocked.some(
              (user: User) => user.userId === userId
            ),
          },
          replies: reply.replies[0]
            ? {
                tweetId,
                replyId: reply.replies[0].tweetId,
                media: reply.replies[0].media,
                content: reply.replies[0].content,
                createdAt: reply.replies[0].createdAt,
                type: TweetType.Reply,
                replier: {
                  imageUrl: reply.replies[0].tweeter.imageUrl,
                  username: reply.replies[0].tweeter.username,
                  jobtitle: reply.replies[0].tweeter.jobtitle,
                  name: reply.replies[0].tweeter.name,
                  bio: reply.replies[0].tweeter.bio,
                  followersCount: reply.replies[0].tweeter.followers.length,
                  followingsCount: reply.replies[0].tweeter.following.length,
                  isFollowed: reply.replies[0].tweeter.followers.some(
                    (user: User) => user.userId === userId
                  ),
                  isMuted: reply.replies[0].tweeter.muted.some(
                    (user: User) => user.userId === userId
                  ),
                  isBlocked: reply.replies[0].tweeter.blocked.some(
                    (user: User) => user.userId === userId
                  ),
                },
                mentions: reply.replies[0].mentions
                  ? reply.mentions.map((mention) => {
                      return mention.userMentioned.username;
                    })
                  : [],
                reactCount: reply.replies[0].reactCount,
                reTweetCount: reply.replies[0].reTweetCount,
                isBookmarked: reply.replies[0].bookmarkedBy.some(
                  (user: User) => user.userId === userId
                ),
                isReacted: reply.replies[0].reacts.some(
                  (user: User) => user.userId === userId
                ),
                isRetweeted: reply.replies[0].retweets.some(
                  (retweet: Tweet) => retweet.tweeter.userId === userId
                ),
              }
            : {},
          mentions: reply.mentions
            ? reply.mentions.map((mention) => {
                return mention.userMentioned.username;
              })
            : [],
          reactCount: reply.reactCount,
          reTweetCount: reply.reTweetCount,
          repliesCount: reply.repliesCount,
          isBookmarked: reply.bookmarkedBy.some(
            (user: User) => user.userId === userId
          ),
          isReacted: reply.reacts.some((user: User) => user.userId === userId),
          isRetweeted: reply.retweets.some(
            (retweet: Tweet) => retweet.tweeter.userId === userId
          ),
        };
      }),
    };
  };

  getTweetReTweeters = async (userId: number, tweetId: number) => {
    const userRepository = AppDataSource.getRepository(User);

    const retweeters = await userRepository.find({
      where: {
        tweets: {
          retweetTo: { tweetId },
        },
      },
      select: {
        bio: true,
        username: true,
        jobtitle: true,
        name: true,
        imageUrl: true,
        userId: true,
      },
      relations: {
        followers: true,
        following: true,
        blocked: true,
        muted: true,
      },
    });

    return {
      retweeters: retweeters?.map((retweet) => {
        return {
          userId: retweet.userId,
          imageUrl: retweet.imageUrl,
          username: retweet.username,
          jobtitle: retweet.jobtitle,
          name: retweet.name,
          bio: retweet.bio,
          followersCount: retweet.followers.length,
          followingsCount: retweet.following.length,
          isFollowed: retweet.followers.some(
            (user: User) => user.userId === userId
          ),
          isMuted: retweet.muted.some((user: User) => user.userId === userId),
          isBlocked: retweet.blocked.some(
            (user: User) => user.userId === userId
          ),
        };
      }),
    };
  };

  getTweetReTweets = async (userId: number, tweetId: number) => {
    const retweetRepository = AppDataSource.getRepository(Tweet);

    const retweets = await retweetRepository.find({
      where: { retweetTo: { tweetId }, type: TweetType.Quote },
      select: tweetSelectOptions,
      relations: tweetRelations,
    });

    return {
      retweets: retweets.map((retweet) => filterTweet(retweet, userId)),
    };
  };

  getTweetReacters = async (userId: number, tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweets = await tweetRepository.findOne({
      where: { tweetId },
      select: {
        reacts: {
          bio: true,
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: {
        reacts: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
      },
    });

    return {
      reacters: tweets?.reacts.map((reacter) => {
        const isBlocked = reacter.blocked.some(
          (user: User) => user.userId === userId
        );
        const isMuted = reacter.muted.some(
          (user: User) => user.userId === userId
        );
        const isFollowed = reacter.followers.some(
          (user: User) => user.userId === userId
        );

        return {
          imageUrl: reacter.imageUrl,
          username: reacter.username,
          jobtitle: reacter.jobtitle,
          name: reacter.name,
          bio: reacter.bio,
          followersCount: reacter.followers.length,
          followingsCount: reacter.following.length,
          isFollowed,
          isMuted,
          isBlocked,
        };
      }),
    };
  };

  getTweet = async (userId: number, tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweet = await tweetRepository.findOne({
      where: { tweetId },
      select: tweetSelectOptions,
      relations: tweetRelations,
    });

    if (!tweet) throw new AppError(`No tweet found`, 400);

    return {
      tweet: filterTweet(tweet, userId),
    };
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

  addRetweet = async (
    userId: number,
    tweetId: number,
    body: { content: string; imageUrls?: string[]; gifUrl?: string }
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);

    const type =
      body.content || body.gifUrl || body.imageUrls
        ? TweetType.Quote
        : TweetType.Repost;

    const orgTweet = new Tweet();
    orgTweet.tweetId = tweetId;

    if (type === TweetType.Repost) {
      const user = (await userRepository.findOne({
        where: { userId },
        relations: { tweets: { retweetTo: true } },
      })) as User;

      const tweetIdx = user.tweets.findIndex(
        (tweet) =>
          tweet.type == TweetType.Repost && tweet.retweetTo.tweetId === tweetId
      );

      if (tweetIdx !== -1) {
        await this.deleteTweet(user.tweets[tweetIdx].tweetId);

        return { retweet: {}, message: 'Repost deleted successfully' };
      }
    }

    const { tweet } = await this.createTweet(userId, body, type);
    tweet.retweetTo = orgTweet;

    await tweetRepository.save(tweet);

    return {
      retweet: {
        retweetId: tweet.tweetId,
        createdAt: tweet.createdAt,
        content: tweet.content,
        tweet: {
          tweetId,
        },
      },
      message: `${type} added successfully`,
    };
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
