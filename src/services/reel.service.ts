import { In, Not } from 'typeorm';
import * as fs from 'fs';
import { AppError, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import { Reel, ReelMention, Topic, ReelType, User } from '../entities';
import socketService from './socket.service';

export class ReelsService {
  constructor() {}

  getTimelineReels = async (
    userId: number,
    page: number = 1,
    limit: number = 30,
    lang: string = 'ar'
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: { following: { userId: true } },
      relations: { following: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const followingsIds = user.following.map((following) => following.userId);

    const reelsOfFollowings = await reelRepository.find({
      where: {
        reeler: { userId: In([...followingsIds]) },
        type: In([ReelType.Reel, ReelType.Repost, ReelType.Quote]),
      },
      select: {
        reelUrl: true,
        reelId: true,
        supportedTopics: true,
        content: true,
        createdAt: true,
        type: true,
        rereelTo: {
          reelUrl: true,
          reelId: true,
          content: true,
          createdAt: true,
          type: true,
          supportedTopics: true,
          reeler: {
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
        },
        reeler: {
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
        rereels: true,
      },
      relations: {
        rereelTo: {
          supportedTopics: true,
          replies: true,
          reacts: true,
          rereels: { reeler: true },
          bookmarkedBy: true,
          reeler: {
            followers: true,
            following: true,
            blocked: true,
            muted: true,
          },
          mentions: { userMentioned: true },
        },
        supportedTopics: true,

        replies: true,
        reacts: true,
        reeler: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        rereels: { reeler: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const randomReels = await reelRepository.find({
      where: {
        reeler: { userId: Not(In([...followingsIds])) },
        type: In([ReelType.Reel, ReelType.Repost, ReelType.Quote]),
      },
      select: {
        reelUrl: true,
        reelId: true,

        content: true,
        createdAt: true,
        type: true,
        supportedTopics: true,
        rereelTo: {
          reelUrl: true,
          reelId: true,
          content: true,
          createdAt: true,
          type: true,
          supportedTopics: true,
          reeler: {
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
        },
        reeler: {
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
        rereels: true,
      },
      relations: {
        replies: true,
        reacts: true,
        rereelTo: {
          replies: true,
          reacts: true,
          rereels: { reeler: true },
          bookmarkedBy: true,
          reeler: {
            followers: true,
            following: true,
            blocked: true,
            muted: true,
          },
          mentions: { userMentioned: true },
          supportedTopics: true,
        },
        reeler: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        rereels: { reeler: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
        supportedTopics: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit - reelsOfFollowings.length,
    });

    const timelineReels = [...reelsOfFollowings, ...randomReels].map(
      (reel) => ({
        reelId: reel.reelId,
        reelUrl: reel.reelUrl,
        content: reel.content,
        createdAt: reel.createdAt,
        type: reel.type,
        topics: reel.supportedTopics.map((topic) => {
          return {
            topic: lang === 'ar' ? topic.topic_ar : topic.topic_en,
            description:
              lang === 'ar' ? topic.description_ar : topic.description_en,
          };
        }),
        reeler: {
          userId: reel.reeler.userId,
          imageUrl: reel.reeler.imageUrl,
          username: reel.reeler.username,
          jobtitle: reel.reeler.jobtitle,
          name: reel.reeler.name,
          bio: reel.reeler.bio,
          followersCount: reel.reeler.followers.length,
          followingsCount: reel.reeler.following.length,
          isMuted: reel.reeler.muted.some((user) => user.userId === userId),
          isBlocked: reel.reeler.blocked.some((user) => user.userId === userId),
        },
        originalReeler: reel.rereelTo
          ? {
              userId: reel.rereelTo.reeler.userId,
              imageUrl: reel.rereelTo.reeler.imageUrl,
              username: reel.rereelTo.reeler.username,
              jobtitle: reel.rereelTo.reeler.jobtitle,
              name: reel.rereelTo.reeler.name,
              bio: reel.rereelTo.reeler.bio,
              followersCount: reel.rereelTo.reeler.followers.length,
              followingsCount: reel.rereelTo.reeler.following.length,
              isMuted: reel.rereelTo.reeler.muted.some(
                (user) => user.userId === userId
              ),
              isBlocked: reel.rereelTo.reeler.blocked.some(
                (user) => user.userId === userId
              ),
            }
          : {},
        originalReel: reel.rereelTo
          ? {
              reelId: reel.rereelTo.reelId,
              reelUrl: reel.rereelTo.reelUrl,
              content: reel.rereelTo.content,
              createdAt: reel.rereelTo.createdAt,
              type: reel.rereelTo.type,
              topics: reel.rereelTo.supportedTopics.map((topic) => {
                return {
                  topic: lang === 'ar' ? topic.topic_ar : topic.topic_en,
                  description:
                    lang === 'ar' ? topic.description_ar : topic.description_en,
                };
              }),
              mentions: reel.rereelTo.mentions
                ? reel.rereelTo.mentions.map(
                    (mention) => mention.userMentioned.username
                  )
                : [],
              reactCount: reel.rereelTo.reactCount,
              reReelCount: reel.rereelTo.reReelCount,
              repliesCount: reel.rereelTo.repliesCount,
              isBookmarked: reel.rereelTo.bookmarkedBy.some(
                (user) => user.userId === userId
              ),
              isReacted: reel.rereelTo.reacts.some(
                (user) => user.userId === userId
              ),
              isRereeled: reel.rereelTo.rereels.some(
                (rereel) => rereel.reeler.userId === userId
              ),
            }
          : {},
        mentions: reel.mentions
          ? reel.mentions.map((mention) => mention.userMentioned.username)
          : [],
        reactCount: reel.reactCount,
        reReelCount: reel.reReelCount,
        repliesCount: reel.repliesCount,
        isBookmarked: reel.bookmarkedBy.some((user) => user.userId === userId),
        isReacted: reel.reacts.some((user) => user.userId === userId),
        isRereeled: reel.rereels.some(
          (rereel) => rereel.reeler.userId === userId
        ),
      })
    );

    return { timelineReels };
  };

  createReel = async (
    userId: number,
    body: { content: string; reelUrl?: string; topics?: string[] },
    type: ReelType = ReelType.Reel
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);
    const userRepository = AppDataSource.getRepository(User);
    const topicRepository = AppDataSource.getRepository(Topic);
    const reelMentionRepository = AppDataSource.getRepository(ReelMention);

    if (type == ReelType.Reel && (!body.reelUrl || !body.topics))
      throw new AppError('Must provide a reel vedio and topic', 400);

    if (type == ReelType.Quote && !body.content)
      throw new AppError('Must provide a quote', 400);

    const supportedtopics = body.topics
      ? await topicRepository.find({
          where: [
            {
              topic_ar: In([...body.topics]),
            },
            {
              topic_en: In([...body.topics]),
            },
          ],
        })
      : [];

    const user = new User();
    user.userId = userId;

    const reel = new Reel();
    reel.content = body.content;
    if (body.reelUrl) reel.reelUrl = body.reelUrl;
    reel.reeler = user;
    reel.supportedTopics = supportedtopics;
    reel.type = type;

    await reelRepository.save(reel);

    if (body.content) {
      let usernames =
        (body.content.match(usernameRegex) as Array<string>) || [];

      if (!usernames) return { reel };

      usernames = usernames.map((username) => username.replace('@', ''));

      const users = await userRepository.find({
        where: { username: In([...usernames]) },
      });

      let reelMentions: ReelMention[] = [];

      reelMentions = users.map((mentioned) => {
        let newReelMention = new ReelMention();

        newReelMention.reel = reel;
        newReelMention.userMakingMention = user;
        newReelMention.userMentioned = mentioned;

        return newReelMention;
      });

      await reelMentionRepository.insert(reelMentions);

      // for (const username of usernames) {
      //   await socketService.emitNotification(userId, username, 'MENTION', {
      //     reelId: reel.reelId,
      //   });
      // }
    }

    return { reel };
  };

  addReel = async (
    userId: number,
    body: { content: string; reelUrl: string; topics: string[] }
  ) => {
    body.topics = Array.isArray(body.topics) ? [...body.topics] : [body.topics];

    if (!body.topics) throw new AppError('No topics specified', 400);

    const { reel } = await this.createReel(userId, body);

    return {
      reel: {
        reelId: reel.reelId,
        reelUrl: reel.reelUrl,
        content: reel.content,
        createdAt: reel.createdAt,
        type: reel.type,
        topics: body.topics,
        mentions: reel.mentions
          ? reel.mentions.map((mention) => {
              return mention.userMentioned.username;
            })
          : [],
      },
    };
  };

  addReelReply = async (
    userId: number,
    reelId: number,
    body: { content: string; reelUrl: string; topics: string[] }
  ) => {
    const reelReplyRepository = AppDataSource.getRepository(Reel);

    let originalreel = new Reel();
    originalreel.reelId = reelId;

    let user = new User();
    user.userId = userId;

    const { reel } = await this.createReel(userId, body);
    reel.replyTo = originalreel;
    reel.type = ReelType.Reply;

    await reelReplyRepository.save(reel);

    return {
      reelReply: {
        reelId,
        replyId: reel.reelId,
        reelurl: reel.reelUrl,
        content: reel.content,
        createdAt: reel.createdAt,
        reeler: {
          imageUrl: reel.reeler.imageUrl,
          username: reel.reeler.username,
          jobtitle: reel.reeler.jobtitle,
          name: reel.reeler.name,
          bio: reel.reeler.bio,
        },
        mentions: reel.mentions
          ? reel.mentions.map((mention) => {
              return mention.userMentioned.username;
            })
          : [],
      },
    };
  };

  exists = async (id: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    return await reelRepository.exists({ where: { reelId: id } });
  };

  deleteReel = async (reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reel = await reelRepository.findOne({
      where: { reelId },
      select: { reelUrl: true, reelId: true },
    });

    if (!reel) {
      throw new AppError('Reel not found', 404);
    }

    if (reel.reelUrl) {
      process.env.NODE_ENV !== 'production'
        ? fs.unlinkSync(`${process.env.DEV_MEDIA_PATH}${reel.reelUrl}`)
        : fs.unlinkSync(`${process.env.PROD_MEDIA_PATH}${reel.reelUrl}`);
    }

    await reelRepository.delete({ reelId });
  };

  getReelReplies = async (userId: number, reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const replies = await reelRepository.find({
      where: { replyTo: { reelId } },
      select: {
        reelUrl: true,
        reelId: true,
        content: true,
        createdAt: true,
        reeler: {
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
        rereels: true,
      },
      relations: {
        replies: {
          bookmarkedBy: true,
          rereels: true,
          reacts: true,
          mentions: { userMentioned: true },
          supportedTopics: true,
          reeler: {
            muted: true,
            followers: true,
            following: true,
            blocked: true,
          },
        },
        reacts: true,
        reeler: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        rereels: { reeler: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
        supportedTopics: true,
      },
    });

    return {
      replies: replies.map((reply) => {
        return {
          reelId,
          replyId: reply.reelId,
          reelUrl: reply.reelUrl,
          content: reply.content,
          createdAt: reply.createdAt,
          type: ReelType.Reply,

          replier: {
            imageUrl: reply.reeler.imageUrl,
            username: reply.reeler.username,
            jobtitle: reply.reeler.jobtitle,
            name: reply.reeler.name,
            bio: reply.reeler.bio,
            followersCount: reply.reeler.followers.length,
            followingsCount: reply.reeler.following.length,
            isFollowed: reply.reeler.followers.some(
              (user: User) => user.userId === userId
            ),
            isMuted: reply.reeler.muted.some(
              (user: User) => user.userId === userId
            ),
            isBlocked: reply.reeler.blocked.some(
              (user: User) => user.userId === userId
            ),
          },
          replies: reply.replies[0]
            ? {
                reelId,
                replyId: reply.replies[0].reelId,
                reelUrl: reply.replies[0].reelUrl,
                content: reply.replies[0].content,
                createdAt: reply.replies[0].createdAt,
                type: ReelType.Reply,
                replier: {
                  imageUrl: reply.replies[0].reeler.imageUrl,
                  username: reply.replies[0].reeler.username,
                  jobtitle: reply.replies[0].reeler.jobtitle,
                  name: reply.replies[0].reeler.name,
                  bio: reply.replies[0].reeler.bio,
                  followersCount: reply.replies[0].reeler.followers.length,
                  followingsCount: reply.replies[0].reeler.following.length,
                  isFollowed: reply.replies[0].reeler.followers.some(
                    (user: User) => user.userId === userId
                  ),
                  isMuted: reply.replies[0].reeler.muted.some(
                    (user: User) => user.userId === userId
                  ),
                  isBlocked: reply.replies[0].reeler.blocked.some(
                    (user: User) => user.userId === userId
                  ),
                },
                mentions: reply.replies[0].mentions
                  ? reply.mentions.map((mention) => {
                      return mention.userMentioned.username;
                    })
                  : [],
                reactCount: reply.replies[0].reactCount,
                reReelCount: reply.replies[0].reReelCount,
                isBookmarked: reply.replies[0].bookmarkedBy.some(
                  (user: User) => user.userId === userId
                ),
                isReacted: reply.replies[0].reacts.some(
                  (user: User) => user.userId === userId
                ),
                isRereeled: reply.replies[0].rereels.some(
                  (rereel: Reel) => rereel.reeler.userId === userId
                ),
              }
            : {},
          mentions: reply.mentions
            ? reply.mentions.map((mention) => {
                return mention.userMentioned.username;
              })
            : [],
          reactCount: reply.reactCount,
          reReelCount: reply.reReelCount,
          repliesCount: reply.repliesCount,
          isBookmarked: reply.bookmarkedBy.some(
            (user: User) => user.userId === userId
          ),
          isReacted: reply.reacts.some((user: User) => user.userId === userId),
          isRereeled: reply.rereels.some(
            (rereel: Reel) => rereel.reeler.userId === userId
          ),
        };
      }),
    };
  };

  getReelReReelers = async (userId: number, reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const rereels = await reelRepository.find({
      where: { rereelTo: { reelId } },
      select: {
        reeler: {
          bio: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: {
        reeler: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
      },
    });

    return {
      rereelers: rereels?.map((rereel) => {
        const isBlocked = rereel.reeler.blocked.some(
          (user: User) => user.userId === userId
        );
        const isMuted = rereel.reeler.muted.some(
          (user: User) => user.userId === userId
        );
        const isFollowed = rereel.reeler.followers.some(
          (user: User) => user.userId === userId
        );

        return {
          imageUrl: rereel.reeler.imageUrl,
          username: rereel.reeler.username,
          jobtitle: rereel.reeler.jobtitle,
          name: rereel.reeler.name,
          bio: rereel.reeler.bio,
          followersCount: rereel.reeler.followers.length,
          followingsCount: rereel.reeler.following.length,
          isFollowed,
          isMuted,
          isBlocked,
        };
      }),
    };
  };

  getReelReReels = async (
    userId: number,
    reelId: number,
    lang: string = 'ar'
  ) => {
    const rereelRepository = AppDataSource.getRepository(Reel);

    const rereels = await rereelRepository.find({
      where: { rereelTo: { reelId }, type: ReelType.Quote },
      select: {
        reeler: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
          bio: true,
        },
        rereelTo: {
          reelId: true,
          content: true,
          createdAt: true,
          reelUrl: true,

          reeler: {
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
        reelId: true,

        reelUrl: true,
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
          userId: true,
        },
        bookmarkedBy: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
        rereels: true,
      },
      relations: {
        reeler: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        rereelTo: {
          reeler: {
            followers: true,
            following: true,
            blocked: true,
            muted: true,
          },
          supportedTopics: true,
        },
        replies: true,
        reacts: true,
        rereels: { reeler: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
        supportedTopics: true,
      },
    });

    return {
      rereels: rereels.map((rereel) => {
        return {
          rereelId: rereel.reelId,
          createdAt: rereel.createdAt,
          content: rereel.content,
          type: rereel.type,
          reelUrl: rereel.reelUrl,
          isBookmarked: rereel.bookmarkedBy.some(
            (user: User) => user.userId === userId
          ),
          isReacted: rereel.reacts.some((user: User) => user.userId === userId),
          isRereeled: rereel.rereels.some(
            (rereel: Reel) => rereel.reeler.userId === userId
          ),
          reactCount: rereel.reactCount,
          reReelCount: rereel.reReelCount,
          repliesCount: rereel.repliesCount,
          originalReel: {
            reelId: rereel.rereelTo.reelId,
            reelUrl: rereel.rereelTo.reelUrl,
            content: rereel.rereelTo.content,
            createdAt: rereel.rereelTo.createdAt,
            type: rereel.rereelTo.type,
            topics: rereel.rereelTo.supportedTopics.map((topic) => {
              return {
                topic: lang === 'ar' ? topic.topic_ar : topic.topic_en,
                description:
                  lang === 'ar' ? topic.description_ar : topic.description_en,
              };
            }),
            mentions: rereel.rereelTo.mentions
              ? rereel.rereelTo.mentions.map((mention) => {
                  return mention.userMentioned.username;
                })
              : [],
          },
          originalReeler: {
            imageUrl: rereel.rereelTo.reeler.imageUrl,
            username: rereel.rereelTo.reeler.username,
            jobtitle: rereel.rereelTo.reeler.jobtitle,
            name: rereel.rereelTo.reeler.name,
            bio: rereel.rereelTo.reeler.bio,
            followersCount: rereel.rereelTo.reeler.followers.length,
            followingsCount: rereel.rereelTo.reeler.following.length,
            isFollowed: rereel.reeler.followers.some(
              (user: User) => user.userId === userId
            ),
            isMuted: rereel.reeler.muted.some(
              (user: User) => user.userId === userId
            ),
            isBlocked: rereel.reeler.blocked.some(
              (user: User) => user.userId === userId
            ),
          },
          reeler: {
            imageUrl: rereel.reeler.imageUrl,
            username: rereel.reeler.username,
            jobtitle: rereel.reeler.jobtitle,
            name: rereel.reeler.name,
            bio: rereel.reeler.bio,
            followersCount: rereel.reeler.followers.length,
            followingsCount: rereel.reeler.following.length,
            isFollowed: rereel.rereelTo.reeler.followers.some(
              (user: User) => user.userId === userId
            ),
            isMuted: rereel.rereelTo.reeler.muted.some(
              (user: User) => user.userId === userId
            ),
            isBlocked: rereel.rereelTo.reeler.blocked.some(
              (user: User) => user.userId === userId
            ),
          },
        };
      }),
    };
  };

  getReelReacters = async (userId: number, reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reels = await reelRepository.findOne({
      where: { reelId },
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
      reacters: reels?.reacts.map((reacter) => {
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

  queryReel = async (userId: number, reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reel = await reelRepository.findOne({
      where: { reelId },
      select: {
        reelId: true,
        reelUrl: true,
        content: true,
        createdAt: true,
        supportedTopics: true,
        reeler: {
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
        rereels: true,
      },
      relations: {
        replies: true,
        reacts: true,
        reeler: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        rereels: { reeler: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
        supportedTopics: true,
      },
    });

    if (!reel) throw new AppError(`No reel found`, 400);

    const isBookmarked = reel.bookmarkedBy.some(
      (user: User) => user.userId === userId
    );
    const isReacted = reel.reacts.some((user: User) => user.userId === userId);
    const isBlocked = reel.reeler.blocked.some(
      (user: User) => user.userId === userId
    );
    const isMuted = reel.reeler.muted.some(
      (user: User) => user.userId === userId
    );

    const isFollowed = reel.reeler.followers.some(
      (user: User) => user.userId === userId
    );

    const isRereeled = reel.rereels.some(
      (rereel: Reel) => rereel.reeler.userId === userId
    );

    return {
      reel,
      isBlocked,
      isMuted,
      isFollowed,
      isReacted,
      isRereeled,
      isBookmarked,
    };
  };

  getReel = async (userId: number, reelId: number, lang: string = 'ar') => {
    const {
      reel,
      isBlocked,
      isFollowed,
      isMuted,
      isReacted,
      isBookmarked,
      isRereeled,
    } = await this.queryReel(userId, reelId);

    return {
      reel: {
        reelId,
        reelUrl: reel.reelUrl,
        content: reel.content,
        createdAt: reel.createdAt,
        type: reel.type,
        topics: reel.supportedTopics.map((topic) => {
          return {
            topic: lang === 'ar' ? topic.topic_ar : topic.topic_en,
            description:
              lang === 'ar' ? topic.description_ar : topic.description_en,
          };
        }),

        reeler: {
          imageUrl: reel.reeler.imageUrl,
          username: reel.reeler.username,
          jobtitle: reel.reeler.jobtitle,
          name: reel.reeler.name,
          bio: reel.reeler.bio,
          followersCount: reel.reeler.followers.length,
          followingsCount: reel.reeler.following.length,
          isFollowed,
          isMuted,
          isBlocked,
        },
        mentions: reel.mentions
          ? reel.mentions.map((mention) => {
              return mention.userMentioned.username;
            })
          : [],
        reactCount: reel.reactCount,
        reReelCount: reel.reReelCount,
        repliesCount: reel.repliesCount,
        isBookmarked,
        isReacted,
        isRereeled,
      },
    };
  };

  toggleReelReact = async (userId: number, reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reel = await reelRepository.findOne({
      where: { reelId },
      relations: ['reacts'],
    });

    if (!reel) throw new AppError('No reel found', 404);

    const userIndex = reel.reacts.findIndex((user) => user.userId === userId);

    if (userIndex !== -1) {
      reel.reacts.splice(userIndex, 1);
    } else {
      let user = new User();
      user.userId = userId;
      reel.reacts.push(user);
    }

    await reelRepository.save(reel);
  };

  addRereel = async (
    userId: number,
    reelId: number,
    body: { content: string }
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);
    const userRepository = AppDataSource.getRepository(User);

    const type = body.content ? ReelType.Quote : ReelType.Repost;

    const orgReel = new Reel();
    orgReel.reelId = reelId;

    if (type === ReelType.Repost) {
      const user = (await userRepository.findOne({
        where: { userId },
        relations: { reels: { rereelTo: true } },
      })) as User;

      const reelIdx = user.reels.findIndex(
        (reel) =>
          reel.type == ReelType.Repost && reel.rereelTo.reelId === reelId
      );

      if (reelIdx !== -1) {
        await this.deleteReel(user.reels[reelIdx].reelId);

        return { rereel: {}, message: 'Repost deleted successfully' };
      }
    }

    const { reel } = await this.createReel(userId, body, type);
    reel.rereelTo = orgReel;

    await reelRepository.save(reel);

    return {
      rereel: {
        rereelId: reel.reelId,
        createdAt: reel.createdAt,
        content: reel.content,
        reel: {
          reelId,
        },
      },
      message: `${type} added successfully`,
    };
  };

  toggleBookmark = async (userId: number, reelId: number) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      relations: { reelBookmarks: true },
    });

    if (!user) throw new AppError('No user found', 404);

    const reelIndex = user.reelBookmarks.findIndex(
      (user) => user.reelId === reelId
    );

    if (reelIndex !== -1) {
      user.reelBookmarks.splice(reelIndex, 1);
    } else {
      const reel = new Reel();
      reel.reelId = reelId;
      user.reelBookmarks.push(reel);
    }

    await userRepository.save(user);
  };
}
