import { In, Not } from 'typeorm';
import {
  AppError,
  extractTags,
  filterTweet,
  getPartialUserProfile,
  usernameRegex,
} from '../common';
import { AppDataSource } from '../dataSource';
import { Poll, PollOption } from '../entities/Poll';
import {
  NotificationType,
  Tweet,
  TweetMention,
  TweetType,
  User,
} from '../entities';
import * as fs from 'fs';
import { performance } from 'perf_hooks';

import socketService from './socket.service';
import { TweetMedia } from '../entities/Media';
import {
  tweetRelations,
  tweetSelectOptions,
} from '../common/filters/tweets/tweetSelectOptions';
import { Tag } from '../entities/Tag';
import { NotificationsService } from './notification.service';

const notificationService = new NotificationsService();

export class TweetsService {
  constructor() {}

  getTimelineTweets = async (
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);
    const startTime = performance.now();

    const user = await userRepository.findOne({
      where: { userId },
      select: { following: { userId: true }, blocking: { userId: true } },
      relations: { following: true, blocking: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const followingsIds = user.following.map((following) => following.userId);
    const blockingsIds = user.blocking.map((blocking) => blocking.userId);

    const tweetsOfFollowings = await tweetRepository.find({
      where: {
        tweeter: {
          userId: In([...followingsIds]),
          ...(blockingsIds.length > 0 && {
            userId: Not(In([...blockingsIds])),
          }),
        },
        type: In([TweetType.Tweet, TweetType.Repost, TweetType.Quote]),
      },
      select: tweetSelectOptions,
      relations: tweetRelations,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    console.log(tweetsOfFollowings);

    let randomTweets: Tweet[] = [];
    if (tweetsOfFollowings.length < limit) {
      randomTweets = await tweetRepository.find({
        where: {
          tweeter: {
            userId: Not(In([...followingsIds])),
            ...(blockingsIds.length > 0 && {
              userId: Not(In([...blockingsIds])),
            }),
          },
          type: In([TweetType.Tweet, TweetType.Repost, TweetType.Quote]),
        },
        select: tweetSelectOptions,
        relations: tweetRelations,
        order: { createdAt: 'DESC' },
        skip: 0,
        take: limit - tweetsOfFollowings.length,
      });
    }

    const mergedTweets = [...tweetsOfFollowings, ...randomTweets];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTweets = mergedTweets.slice(startIndex, endIndex);

    const timelineTweets = paginatedTweets.map((tweet) =>
      filterTweet(tweet, userId)
    );

    const endTime = performance.now();
    console.log(
      `timeline tweets fetch Execution time: ${(endTime - startTime)/1000.0} s`
    );
    console.log(`for number of tweets: ${timelineTweets.length}`);

    return { timelineTweets };
  };

  extractMentions = async (user: User, content: string, tweet: Tweet) => {
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);
    const userRepository = AppDataSource.getRepository(User);

    let usernames = (content.match(usernameRegex) as Array<string>) || [];

    if (!usernames) return { usernames: undefined };

    usernames = usernames.map((username) => username.replace('@', ''));

    const users = await userRepository.find({
      select: { userId: true, username: true },
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

    usernames = users.map((user) => user.username);

    for (const username of usernames) {
      await socketService.emitNotification(
        user.userId,
        username,
        NotificationType.Mention_Tweet,
        {
          tweetId: tweet.tweetId,
        }
      );
    }

    return { usernames };
  };

  createTweet = async (
    userId: number,
    body: { content: string; imageUrls?: string[]; gifUrl?: string },
    type: TweetType = TweetType.Tweet
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    if (
      type !== TweetType.Repost &&
      !body.content &&
      !body.imageUrls &&
      !body.gifUrl
    )
      throw new AppError('Must provide content or media', 400);

    const user = new User();
    user.userId = userId;

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
    const { hashtags } = await extractTags(body.content);
    tweet.tags = hashtags || [];

    const savedtweet = await tweetRepository.save(tweet);

    let mentions: string[] | undefined = [];
    if (body.content) {
      const { usernames } = await this.extractMentions(
        user,
        body.content,
        savedtweet
      );
      mentions = usernames;
    }

    return { tweet: savedtweet, mentions };
  };

  addTweet = async (
    userId: number,
    body: { content: string; imageUrls?: string[]; gifUrl?: string }
  ) => {
    const { tweet, mentions } = await this.createTweet(userId, body);

    return {
      tweet: {
        tweetId: tweet.tweetId,
        media: tweet.media,
        content: tweet.content,
        createdAt: tweet.createdAt,
        type: tweet.type,
        mentions,
      },
    };
  };

  addTweetReply = async (
    userId: number,
    tweetId: number,
    body: { content: string; imageUrls: string[]; gifUrl: string }
  ) => {
    const tweetReplyRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);

    let originaltweet = new Tweet();
    originaltweet.tweetId = tweetId;

    let user = new User();
    user.userId = userId;

    const { tweet, mentions } = await this.createTweet(
      userId,
      body,
      TweetType.Reply
    );
    tweet.replyTo = originaltweet;

    const savedtweet = await tweetReplyRepository.save(tweet);

    const orgTweeter = await userRepository.findOne({
      where: { tweets: { tweetId } },
      relations: { following: true },
    });

    if (
      orgTweeter &&
      orgTweeter.following.some((followee) => followee.userId === userId)
    ) {
      await socketService.emitNotification(
        userId,
        orgTweeter.username,
        NotificationType.Reply_Tweet,
        { replyId: savedtweet.tweetId }
      );
    }

    return {
      tweetReply: {
        tweetId,
        replyId: savedtweet.tweetId,
        media: savedtweet.media,
        content: savedtweet.content,
        createdAt: savedtweet.createdAt,
        mentions,
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

    const { hashtags } = await extractTags(body.question);
    tweet.tags = hashtags || [];

    const savedtweet = await tweetRepository.save(tweet);

    const { usernames } = await this.extractMentions(
      user,
      body.question,
      savedtweet
    );

    return {
      tweet: {
        tweetId: savedtweet.tweetId,
        createdAt: savedtweet.createdAt,
        type: savedtweet.type,
        poll: {
          pollId: savedtweet.poll.pollId,
          question: savedtweet.poll.question,
          length: savedtweet.poll.length,
          options: savedtweet.poll.options.map((option) => ({
            optionId: option.optionId,
            text: option.text,
            votesCount: 0,
          })),
          totalVotesCount: 0,
        },
        mentions: usernames,
      },
    };
  };

  toggleVote = async (userId: number, pollId: number, optionId: number) => {
    const pollRepository = AppDataSource.getRepository(Poll);

    const poll = await pollRepository.findOne({
      where: { pollId },
      relations: { options: { voters: true } },
    });

    if (!poll) throw new AppError('Poll not found', 404);

    if (poll.length < new Date())
      throw new AppError('poll duration ended', 404);

    const selectedOption = poll.options.find(
      (option) => option.optionId === optionId
    );

    if (!selectedOption) throw new AppError('Option not found', 404);

    const selectedOptionVoters = selectedOption.voters || [];

    const userVotedOption = poll.options.find((option) =>
      option.voters.some((voter) => voter.userId === userId)
    );

    if (userVotedOption && userVotedOption !== selectedOption) {
      const existingVoteIndex = userVotedOption.voters.findIndex(
        (voter) => voter.userId === userId
      );
      if (existingVoteIndex !== -1) {
        userVotedOption.voters.splice(existingVoteIndex, 1);
      }
    }

    const user = new User();
    user.userId = userId;

    const existingVoteIndex = selectedOptionVoters.findIndex(
      (voter) => voter.userId === userId
    );

    if (existingVoteIndex !== -1) {
      selectedOptionVoters.splice(existingVoteIndex, 1);
    } else {
      selectedOptionVoters.push(user);
    }

    selectedOption.voters = selectedOptionVoters;
    await pollRepository.save(poll);
  };

  exists = async (id: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    return await tweetRepository.exists({ where: { tweetId: id } });
  };

  pollExists = async (id: number) => {
    const tweetRepository = AppDataSource.getRepository(Poll);

    return await tweetRepository.exists({ where: { pollId: id } });
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
        try {
          process.env.NODE_ENV !== 'production'
            ? fs.unlinkSync(`${process.env.DEV_MEDIA_PATH}/tweets/${media.url}`)
            : fs.unlinkSync(
                `${process.env.PROD_MEDIA_PATH}/tweets/${media.url}`
              );
        } catch (err) {
          console.error('Error while unlinking file:', err);
        }
      });
    }

    await tweetRepository.delete({ tweetId });
  };

  getTweetReplies = async (
    userId: number,
    tweetId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const replies = await tweetRepository.find({
      where: { replyTo: { tweetId } },
      select: {
        tweetId: true,
        media: true,
        content: true,
        createdAt: true,
        replyTo: {
          createdAt: true,
          tweeter: {
            username: true,
          },
        },
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
        replyTo: { tweeter: true },
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
      skip: (page - 1) * limit,
      take: limit,
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
          originalTweeter: {
            username: reply.replyTo.tweeter.username,
          },
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

  getTweetReTweeters = async (
    userId: number,
    tweetId: number,
    page: number = 1,
    limit: number = 30
  ) => {
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
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      retweeters: retweeters?.map((retweeter) =>
        getPartialUserProfile(retweeter, userId)
      ),
    };
  };

  getTweetReTweets = async (
    userId: number,
    tweetId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const retweetRepository = AppDataSource.getRepository(Tweet);

    const retweets = await retweetRepository.find({
      where: { retweetTo: { tweetId }, type: TweetType.Quote },
      select: tweetSelectOptions,
      relations: tweetRelations,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      retweets: retweets.map((retweet) => filterTweet(retweet, userId)),
    };
  };

  getTweetReacters = async (
    userId: number,
    tweetId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweet = await tweetRepository.findOne({
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

    if (!tweet) throw new AppError('Tweet not found', 404);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedReacters = tweet.reacts
      .slice(startIndex, endIndex)
      .map((reacter) => getPartialUserProfile(reacter, userId));

    return {
      reacters: paginatedReacters,
      currentPage: page,
      totalPages: Math.ceil(tweet.reacts.length / limit),
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
      relations: {
        reacts: true,
        tweeter: {
          following: true,
        },
      },
    });

    if (!tweet) throw new AppError('No tweet found', 404);

    const userIndex = tweet.reacts.findIndex((user) => user.userId === userId);

    if (userIndex !== -1) {
      tweet.reacts.splice(userIndex, 1);
      const { notificationId } = await notificationService.deleteNotification(
        { tweetId },
        NotificationType.React_Tweet
      );

      socketService.emitDeleteNotification(
        tweet.tweeter!.userId,
        notificationId
      );
    } else {
      let user = new User();
      user.userId = userId;
      tweet.reacts.push(user);

      if (
        tweet?.tweeter &&
        tweet.tweeter.following.some((followee) => followee.userId === userId)
      ) {
        await socketService.emitNotification(
          userId,
          tweet.tweeter.username,
          NotificationType.React_Tweet,
          { tweetId }
        );
      }
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

    const orgTweeter = await userRepository.findOne({
      where: { tweets: { tweetId } },
      relations: { following: true },
    });

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
        const { notificationId } = await notificationService.deleteNotification(
          { retweetId: user.tweets[tweetIdx].tweetId },
          NotificationType.Repost_Tweet
        );

        socketService.emitDeleteNotification(
          orgTweeter!.userId,
          notificationId
        );

        return { retweet: {}, message: 'Repost deleted successfully' };
      }
    }

    const { tweet } = await this.createTweet(userId, body, type);
    tweet.retweetTo = orgTweet;

    const savedtweet = await tweetRepository.save(tweet);

    if (
      orgTweeter &&
      orgTweeter.following.some((followee) => followee.userId === userId)
    ) {
      await socketService.emitNotification(
        userId,
        orgTweeter.username,
        type === TweetType.Repost
          ? NotificationType.Repost_Tweet
          : NotificationType.Quote_Tweet,
        { retweetId: savedtweet.tweetId }
      );
    }
    return {
      retweet: {
        retweetId: savedtweet.tweetId,
        createdAt: savedtweet.createdAt,
        content: savedtweet.content,
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

  getTweetsSupportingTag = async (
    userId: number,
    tag: string,
    page: number = 1,
    limit: number = 30
  ) => {
    const tweets = await AppDataSource.getRepository(Tweet).find({
      where: { tags: { tag } },
      select: tweetSelectOptions,
      relations: tweetRelations,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      tweets: tweets.map((tweet) => filterTweet(tweet, userId)),
    };
  };
}
