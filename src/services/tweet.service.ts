import { In, Not } from 'typeorm';
import { AppError, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import { Poll, PollOption } from '../entities/Poll';
import { Tweet, TweetMention, TweetType, User } from '../entities';
import * as fs from 'fs';

import socketService from './socket.service';

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
      select: {
        imageUrls: true,
        tweetId: true,
        gifUrl: true,
        content: true,
        createdAt: true,
        type: true,
        retweetTo: {
          imageUrls: true,
          tweetId: true,
          gifUrl: true,
          content: true,
          createdAt: true,
          type: true,
          tweeter: {
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
            userId: true,
            bio: true,
          },
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
                userId: true,
              },
            },
          },
          mentions: {
            mentionedAt: true,
            userMentioned: { username: true },
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
              userId: true,
            },
          },
        },
      },
      relations: {
        retweetTo: {
          replies: true,
          reacts: true,
          retweets: { tweeter: true },
          bookmarkedBy: true,
          tweeter: {
            followers: true,
            following: true,
            blocked: true,
            muted: true,
          },
          mentions: { userMentioned: true },
          poll: { options: { voters: true } },
        },
        replies: true,
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
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const randomTweets = await tweetRepository.find({
      where: {
        tweeter: { userId: Not(In([...followingsIds])) },
        type: In([TweetType.Tweet, TweetType.Repost, TweetType.Quote]),
      },
      select: {
        imageUrls: true,
        tweetId: true,
        gifUrl: true,
        content: true,
        createdAt: true,
        type: true,
        retweetTo: {
          imageUrls: true,
          tweetId: true,
          gifUrl: true,
          content: true,
          createdAt: true,
          type: true,
          tweeter: {
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
            userId: true,
            bio: true,
          },
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
                userId: true,
              },
            },
          },
          mentions: {
            mentionedAt: true,
            userMentioned: { username: true },
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
              userId: true,
            },
          },
        },
      },
      relations: {
        replies: true,
        reacts: true,
        retweetTo: {
          replies: true,
          reacts: true,
          retweets: { tweeter: true },
          bookmarkedBy: true,
          tweeter: {
            followers: true,
            following: true,
            blocked: true,
            muted: true,
          },
          mentions: { userMentioned: true },
          poll: { options: { voters: true } },
        },
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
      order: {
        createdAt: 'DESC',
      },
      take: limit - tweetsOfFollowings.length,
    });

    const timelineTweets = [...tweetsOfFollowings, ...randomTweets].map(
      (tweet) => ({
        tweetId: tweet.tweetId,
        gifUrl: tweet.gifUrl,
        imageUrls: tweet.imageUrls,
        content: tweet.content,
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
                votesCount: option.voters.length,
              })),
              totalVotesCount: tweet.poll.totalVoters,
            }
          : {},
        tweeter: {
          userId: tweet.tweeter.userId,
          imageUrl: tweet.tweeter.imageUrl,
          username: tweet.tweeter.username,
          jobtitle: tweet.tweeter.jobtitle,
          name: tweet.tweeter.name,
          bio: tweet.tweeter.bio,
          followersCount: tweet.tweeter.followers.length,
          followingsCount: tweet.tweeter.following.length,
          isMuted: tweet.tweeter.muted.some((user) => user.userId === userId),
          isBlocked: tweet.tweeter.blocked.some(
            (user) => user.userId === userId
          ),
        },
        originalTweeter: tweet.retweetTo
          ? {
              userId: tweet.retweetTo.tweeter.userId,
              imageUrl: tweet.retweetTo.tweeter.imageUrl,
              username: tweet.retweetTo.tweeter.username,
              jobtitle: tweet.retweetTo.tweeter.jobtitle,
              name: tweet.retweetTo.tweeter.name,
              bio: tweet.retweetTo.tweeter.bio,
              followersCount: tweet.retweetTo.tweeter.followers.length,
              followingsCount: tweet.retweetTo.tweeter.following.length,
              isMuted: tweet.retweetTo.tweeter.muted.some(
                (user) => user.userId === userId
              ),
              isBlocked: tweet.retweetTo.tweeter.blocked.some(
                (user) => user.userId === userId
              ),
            }
          : {},
        originalTweet: tweet.retweetTo
          ? {
              tweetId: tweet.retweetTo.tweetId,
              gifUrl: tweet.retweetTo.gifUrl,
              imageUrls: tweet.retweetTo.imageUrls,
              content: tweet.retweetTo.content,
              createdAt: tweet.retweetTo.createdAt,
              type: tweet.retweetTo.type,
              poll: tweet.retweetTo.poll
                ? {
                    pollId: tweet.retweetTo.poll.pollId,
                    question: tweet.retweetTo.poll.question,
                    length: tweet.retweetTo.poll.length,
                    options: tweet.retweetTo.poll.options.map((option) => ({
                      optionId: option.optionId,
                      text: option.text,
                      votesCount: option.voters.length,
                    })),
                    totalVotesCount: tweet.retweetTo.poll.totalVoters,
                  }
                : {},
              mentions: tweet.retweetTo.mentions
                ? tweet.retweetTo.mentions.map(
                    (mention) => mention.userMentioned.username
                  )
                : [],
              reactCount: tweet.retweetTo.reactCount,
              reTweetCount: tweet.retweetTo.reTweetCount,
              repliesCount: tweet.retweetTo.repliesCount,
              isBookmarked: tweet.retweetTo.bookmarkedBy.some(
                (user) => user.userId === userId
              ),
              isReacted: tweet.retweetTo.reacts.some(
                (user) => user.userId === userId
              ),
              isRetweeted: tweet.retweetTo.retweets.some(
                (retweet) => retweet.tweeter.userId === userId
              ),
            }
          : {},
        mentions: tweet.mentions
          ? tweet.mentions.map((mention) => mention.userMentioned.username)
          : [],
        reactCount: tweet.reactCount,
        reTweetCount: tweet.reTweetCount,
        repliesCount: tweet.repliesCount,
        isBookmarked: tweet.bookmarkedBy.some((user) => user.userId === userId),
        isReacted: tweet.reacts.some((user) => user.userId === userId),
        isRetweeted: tweet.retweets.some(
          (retweet) => retweet.tweeter.userId === userId
        ),
      })
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
    tweet.imageUrls = body.imageUrls || [];
    tweet.gifUrl = body.gifUrl || '';
    tweet.tweeter = user;
    tweet.type = type;

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
        gifUrl: tweet.gifUrl,
        imageUrls: tweet.imageUrls,
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
        gifUrl: tweet.gifUrl,
        imageUrls: tweet.imageUrls,
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

  deleteTweet = async (tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweet = await tweetRepository.findOne({
      where: { tweetId },
      select: { imageUrls: true, gifUrl: true, tweetId: true },
    });

    if (!tweet) {
      throw new AppError('Tweet not found', 404);
    }

    if (tweet.imageUrls && tweet.imageUrls.length > 0) {
      tweet.imageUrls.forEach((imageUrl) => {
        process.env.NODE_ENV !== 'production'
          ? fs.unlinkSync(`${process.env.DEV_MEDIA_PATH}${imageUrl}`)
          : fs.unlinkSync(`${process.env.PROD_MEDIA_PATH}${imageUrl}`);
      });
    }

    if (tweet.gifUrl) {
      process.env.NODE_ENV !== 'production'
        ? fs.unlinkSync(`${process.env.DEV_MEDIA_PATH}${tweet.gifUrl}`)
        : fs.unlinkSync(`${process.env.PROD_MEDIA_PATH}${tweet.gifUrl}`);
    }

    await tweetRepository.delete({ tweetId });
  };

  getTweetReplies = async (userId: number, tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const replies = await tweetRepository.find({
      where: { replyTo: { tweetId } },
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
          gifUrl: reply.gifUrl,
          imageUrls: reply.imageUrls,
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
                gifUrl: reply.replies[0].gifUrl,
                imageUrls: reply.replies[0].imageUrls,
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
      select: {
        tweeter: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
          bio: true,
        },
        retweetTo: {
          tweetId: true,
          content: true,
          createdAt: true,
          gifUrl: true,
          imageUrls: true,
          tweeter: {
            email: true,
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
            userId: true,
            bio: true,
          },
        },
        content: true,
        createdAt: true,
        tweetId: true,
        imageUrls: true,
        gifUrl: true,
        type: true,
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
      relations: {
        tweeter: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        retweetTo: {
          tweeter: {
            followers: true,
            following: true,
            blocked: true,
            muted: true,
          },
          poll: { options: { voters: true } },
        },
        replies: true,
        reacts: true,
        retweets: { tweeter: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
      },
    });

    return {
      retweets: retweets.map((retweet) => {
        return {
          retweetId: retweet.tweetId,
          createdAt: retweet.createdAt,
          content: retweet.content,
          type: retweet.type,
          imageUrls: retweet.imageUrls,
          gifUrl: retweet.gifUrl,
          isBookmarked: retweet.bookmarkedBy.some(
            (user: User) => user.userId === userId
          ),
          isReacted: retweet.reacts.some(
            (user: User) => user.userId === userId
          ),
          isRetweeted: retweet.retweets.some(
            (retweet: Tweet) => retweet.tweeter.userId === userId
          ),
          reactCount: retweet.reactCount,
          reTweetCount: retweet.reTweetCount,
          repliesCount: retweet.repliesCount,
          tweet: {
            tweetId: retweet.retweetTo.tweetId,
            gifUrl: retweet.retweetTo.gifUrl,
            imageUrls: retweet.retweetTo.imageUrls,
            content: retweet.retweetTo.content,
            createdAt: retweet.retweetTo.createdAt,
            type: retweet.retweetTo.type,
            poll: retweet.retweetTo.poll
              ? {
                  pollId: retweet.retweetTo.poll.pollId,
                  question: retweet.retweetTo.poll.question,
                  length: retweet.retweetTo.poll.length,
                  options: retweet.retweetTo.poll.options.map((option) => ({
                    optionId: option.optionId,
                    text: option.text,
                    votesCount: option.voters.length,
                  })),
                  totalVotesCount: retweet.retweetTo.poll.totalVoters,
                }
              : {},

            mentions: retweet.retweetTo.mentions
              ? retweet.retweetTo.mentions.map((mention) => {
                  return mention.userMentioned.username;
                })
              : [],
          },
          originalTweeter: {
            imageUrl: retweet.retweetTo.tweeter.imageUrl,
            username: retweet.retweetTo.tweeter.username,
            jobtitle: retweet.retweetTo.tweeter.jobtitle,
            name: retweet.retweetTo.tweeter.name,
            bio: retweet.retweetTo.tweeter.bio,
            followersCount: retweet.retweetTo.tweeter.followers.length,
            followingsCount: retweet.retweetTo.tweeter.following.length,
            isFollowed: retweet.tweeter.followers.some(
              (user: User) => user.userId === userId
            ),
            isMuted: retweet.tweeter.muted.some(
              (user: User) => user.userId === userId
            ),
            isBlocked: retweet.tweeter.blocked.some(
              (user: User) => user.userId === userId
            ),
          },
          tweeter: {
            imageUrl: retweet.tweeter.imageUrl,
            username: retweet.tweeter.username,
            jobtitle: retweet.tweeter.jobtitle,
            name: retweet.tweeter.name,
            bio: retweet.tweeter.bio,
            followersCount: retweet.tweeter.followers.length,
            followingsCount: retweet.tweeter.following.length,
            isFollowed: retweet.retweetTo.tweeter.followers.some(
              (user: User) => user.userId === userId
            ),
            isMuted: retweet.retweetTo.tweeter.muted.some(
              (user: User) => user.userId === userId
            ),
            isBlocked: retweet.retweetTo.tweeter.blocked.some(
              (user: User) => user.userId === userId
            ),
          },
        };
      }),
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

  queryTweet = async (userId: number, tweetId: number) => {
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
        replies: true,
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

    const isFollowed = tweet.tweeter.followers.some(
      (user: User) => user.userId === userId
    );

    const isRetweeted = tweet.retweets.some(
      (retweet: Tweet) => retweet.tweeter.userId === userId
    );

    return {
      tweet,
      isBlocked,
      isMuted,
      isFollowed,
      isReacted,
      isRetweeted,
      isBookmarked,
    };
  };

  getTweet = async (userId: number, tweetId: number) => {
    const {
      tweet,
      isBlocked,
      isFollowed,
      isMuted,
      isReacted,
      isBookmarked,
      isRetweeted,
    } = await this.queryTweet(userId, tweetId);

    return {
      tweet: {
        tweetId,
        gifUrl: tweet.gifUrl,
        imageUrls: tweet.imageUrls,
        content: tweet.content,
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
                votesCount: option.voters.length,
              })),
              totalVotesCount: tweet.poll.totalVoters,
            }
          : {},
        tweeter: {
          imageUrl: tweet.tweeter.imageUrl,
          username: tweet.tweeter.username,
          jobtitle: tweet.tweeter.jobtitle,
          name: tweet.tweeter.name,
          bio: tweet.tweeter.bio,
          followersCount: tweet.tweeter.followers.length,
          followingsCount: tweet.tweeter.following.length,
          isFollowed,
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
        isBookmarked,
        isReacted,
        isRetweeted,
      },
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
