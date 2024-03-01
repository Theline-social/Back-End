import { In, Not } from 'typeorm';
import { AppError, options, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import { Poll, PollOption } from '../entities/Poll';
import { Tweet, TweetMention, TweetType, User } from '../entities';

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
        type: In([TweetType.Tweet, TweetType.ReTweet]),
      },
      select: {
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
        type: In([TweetType.Tweet, TweetType.ReTweet]),
      },
      select: {
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
    body: { content: string; imageUrls?: string[]; gifUrl?: string }
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);

    if (!body.content && !body.imageUrls && !body.gifUrl)
      throw new AppError('Must provide content or images', 400);

    const user = await userRepository.findOne({
      where: { userId },
    });

    if (!user) throw new AppError('User not found', 404);

    const tweet = new Tweet();
    tweet.content = body.content;
    tweet.imageUrls = body.imageUrls || [];
    tweet.gifUrl = body.gifUrl || '';
    tweet.tweeter = user;

    try {
      await tweetRepository.save(tweet);

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
        replyId: tweetId,
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

    return {
      replies: replies.map((reply) => {
        const isBookmarked = reply.bookmarkedBy.some(
          (user: User) => user.userId === userId
        );
        const isReacted = reply.reacts.some(
          (user: User) => user.userId === userId
        );
        const isTweeterBlocked = reply.tweeter.blocked.some(
          (user: User) => user.userId === userId
        );
        const isTweeterMuted = reply.tweeter.muted.some(
          (user: User) => user.userId === userId
        );
        const isTweeterFollowed = reply.tweeter.followers.some(
          (user: User) => user.userId === userId
        );
        const isRetweeted = reply.retweets.some(
          (retweet: Tweet) => retweet.tweeter.userId === userId
        );

        return {
          replyId: reply.tweetId,
          gifUrl: reply.gifUrl,
          imageUrls: reply.imageUrls,
          content: reply.content,
          createdAt: reply.createdAt,
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
            isTweeterFollowed,
            isTweeterMuted,
            isTweeterBlocked,
          },
          replies: reply.replies,
          mentions: reply.mentions
            ? reply.mentions.map((mention) => {
                return mention.userMentioned.username;
              })
            : [],
          reactCount: reply.reactCount,
          reTweetCount: reply.reTweetCount,
          repliesCount: reply.repliesCount,
          isBookmarked,
          isReacted,
          isRetweeted,
        };
      }),
    };
  };

  getTweetReTweeters = async (userId: number, tweetId: number) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const retweets = await tweetRepository.find({
      where: { retweetTo: { tweetId } },
      select: {
        tweeter: {
          bio: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: {
        tweeter: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
      },
    });

    return {
      retweeters: retweets?.map((retweet) => {
        const isTweeterBlocked = retweet.tweeter.blocked.some(
          (user: User) => user.userId === userId
        );
        const isTweeterMuted = retweet.tweeter.muted.some(
          (user: User) => user.userId === userId
        );
        const isTweeterFollowed = retweet.tweeter.followers.some(
          (user: User) => user.userId === userId
        );

        return {
          imageUrl: retweet.tweeter.imageUrl,
          username: retweet.tweeter.username,
          jobtitle: retweet.tweeter.jobtitle,
          name: retweet.tweeter.name,
          bio: retweet.tweeter.bio,
          followersCount: retweet.tweeter.followers.length,
          followingsCount: retweet.tweeter.following.length,
          isTweeterFollowed,
          isTweeterMuted,
          isTweeterBlocked,
        };
      }),
    };
  };

  getTweetReTweets = async (userId: number, tweetId: number) => {
    const retweetRepository = AppDataSource.getRepository(Tweet);

    const retweets = await retweetRepository.find({
      where: { retweetTo: { tweetId } },
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
        retweetTo: { tweeter: true },
        replies: true,
        reacts: true,
        retweets: true,
        bookmarkedBy: true,
        mentions: { userMentioned: true },
      },
    });

    return {
      retweets: retweets.map((retweet) => {
        const isBookmarked = retweet.bookmarkedBy.some(
          (user: User) => user.userId === userId
        );

        const isRetweeted = retweet.retweets.some(
          (retweet: Tweet) => retweet.tweeter.userId === userId
        );

        const isReacted = retweet.reacts.some(
          (user: User) => user.userId === userId
        );

        const isReTweeterBlocked = retweet.tweeter.blocked.some(
          (user: User) => user.userId === userId
        );

        const isReTweeterMuted = retweet.tweeter.muted.some(
          (user: User) => user.userId === userId
        );

        const isReTweeterFollowed = retweet.tweeter.followers.some(
          (user: User) => user.userId === userId
        );

        const isTweeterBlocked = retweet.retweetTo.tweeter.blocked.some(
          (user: User) => user.userId === userId
        );
        const isTweeterMuted = retweet.retweetTo.tweeter.muted.some(
          (user: User) => user.userId === userId
        );
        const isTweeterFollowed = retweet.retweetTo.tweeter.followers.some(
          (user: User) => user.userId === userId
        );

        return {
          retweetId: retweet.tweetId,
          createdAt: retweet.createdAt,
          content: retweet.content,
          isBookmarked,
          isReacted,
          isRetweeted,
          tweet: {
            tweetId: retweet.retweetTo.tweetId,
            gifUrl: retweet.retweetTo.gifUrl,
            imageUrls: retweet.retweetTo.imageUrls,
            content: retweet.retweetTo.content,
            createdAt: retweet.retweetTo.createdAt,
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
          tweeter: {
            imageUrl: retweet.retweetTo.tweeter.imageUrl,
            username: retweet.retweetTo.tweeter.username,
            jobtitle: retweet.retweetTo.tweeter.jobtitle,
            name: retweet.retweetTo.tweeter.name,
            bio: retweet.retweetTo.tweeter.bio,
            followersCount: retweet.retweetTo.tweeter.followers.length,
            followingsCount: retweet.retweetTo.tweeter.following.length,
            isReTweeterFollowed,
            isReTweeterMuted,
            isReTweeterBlocked,
          },
          retweeter: {
            imageUrl: retweet.tweeter.imageUrl,
            username: retweet.tweeter.username,
            jobtitle: retweet.tweeter.jobtitle,
            name: retweet.tweeter.name,
            bio: retweet.tweeter.bio,
            followersCount: retweet.tweeter.followers.length,
            followingsCount: retweet.tweeter.following.length,
            isTweeterFollowed,
            isTweeterMuted,
            isTweeterBlocked,
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
        const isTweeterBlocked = reacter.blocked.some(
          (user: User) => user.userId === userId
        );
        const isTweeterMuted = reacter.muted.some(
          (user: User) => user.userId === userId
        );
        const isTweeterFollowed = reacter.followers.some(
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
          isTweeterFollowed,
          isTweeterMuted,
          isTweeterBlocked,
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
    const isTweeterBlocked = tweet.tweeter.blocked.some(
      (user: User) => user.userId === userId
    );
    const isTweeterMuted = tweet.tweeter.muted.some(
      (user: User) => user.userId === userId
    );

    const isTweeterFollowed = tweet.tweeter.followers.some(
      (user: User) => user.userId === userId
    );

    const isRetweeted = tweet.retweets.some(
      (retweet: Tweet) => retweet.tweeter.userId === userId
    );

    return {
      tweet,
      isTweeterBlocked,
      isTweeterMuted,
      isTweeterFollowed,
      isReacted,
      isRetweeted,
      isBookmarked,
    };
  };

  getTweet = async (userId: number, tweetId: number) => {
    const {
      tweet,
      isTweeterBlocked,
      isTweeterFollowed,
      isTweeterMuted,
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
          isTweeterFollowed,
          isTweeterMuted,
          isTweeterBlocked,
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
    body: { content: string }
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const orgTweet = new Tweet();
    orgTweet.tweetId = tweetId;

    const { tweet } = await this.createTweet(userId, body);
    tweet.retweetTo = orgTweet;
    tweet.type = TweetType.ReTweet;

    await tweetRepository.save(tweet);

    return { retweet: tweet };
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
