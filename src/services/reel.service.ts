import { In, Not } from 'typeorm';
import * as fs from 'fs';
import {
  AppError,
  extractTags,
  getPartialUserProfile,
  usernameRegex,
} from '../common';
import { AppDataSource } from '../dataSource';
import {
  Reel,
  ReelMention,
  Topic,
  ReelType,
  User,
  NotificationType,
} from '../entities';
import socketService from './socket.service';
import {
  reelRelations,
  reelSelectOptions,
} from '../common/filters/reels/reelSelectOptions';
import { filterReel } from '../common/filters/reels/filterReel';
import { NotificationsService } from './notification.service';

const notificationService = new NotificationsService();

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
      select: reelSelectOptions,
      relations: reelRelations,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const randomReels = await reelRepository.find({
      where: {
        reeler: { userId: Not(In([...followingsIds])) },
        type: In([ReelType.Reel, ReelType.Repost, ReelType.Quote]),
      },
      select: reelSelectOptions,
      relations: reelRelations,
      order: {
        createdAt: 'DESC',
      },
      take: limit - reelsOfFollowings.length,
    });

    const timelineReels = [...reelsOfFollowings, ...randomReels].map((reel) =>
      filterReel(reel, userId, lang)
    );

    return { timelineReels };
  };

  extractMentions = async (user: User, content: string, reel: Reel) => {
    const userRepository = AppDataSource.getRepository(User);
    const reelMentionRepository = AppDataSource.getRepository(ReelMention);

    let usernames = (content.match(usernameRegex) as Array<string>) || [];

    if (!usernames) return { usernames: undefined };

    usernames = usernames.map((username) => username.replace('@', ''));

    const users = await userRepository.find({
      select: { userId: true, username: true },
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

    usernames = users.map((user) => user.username);

    for (const username of usernames) {
      await socketService.emitNotification(
        user.userId,
        username,
        NotificationType.Mention_Reel,
        {
          reelId: reel.reelId,
        }
      );
    }

    return { usernames };
  };

  createReel = async (
    userId: number,
    body: { content: string; reelUrl?: string; topics?: string[] },
    type: ReelType = ReelType.Reel
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);
    const topicRepository = AppDataSource.getRepository(Topic);

    if (type == ReelType.Reel && (!body.reelUrl || !body.topics))
      throw new AppError('Must provide a reel vedio and topic', 400);

    if ((type == ReelType.Quote || type == ReelType.Reply) && !body.content)
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

    const { hashtags } = await extractTags(body.content);
    reel.tags = hashtags || [];

    const savedreel = await reelRepository.save(reel);

    let mentions: string[] | undefined = [];
    if (body.content) {
      const { usernames } = await this.extractMentions(
        user,
        body.content,
        savedreel
      );
      mentions = usernames;
    }

    return { reel: savedreel, mentions };
  };

  addReel = async (
    userId: number,
    body: { content: string; reelUrl: string; topics: string[] }
  ) => {
    body.topics = Array.isArray(body.topics) ? [...body.topics] : [body.topics];

    const { reel, mentions } = await this.createReel(
      userId,
      body,
      ReelType.Reel
    );

    return {
      reel: {
        reelId: reel.reelId,
        reelUrl: reel.reelUrl,
        content: reel.content,
        createdAt: reel.createdAt,
        type: reel.type,
        topics: body.topics,
        mentions: mentions,
      },
    };
  };

  addReelReply = async (
    userId: number,
    reelId: number,
    body: { content: string }
  ) => {
    const reelReplyRepository = AppDataSource.getRepository(Reel);
    const userRepository = AppDataSource.getRepository(User);

    let originalreel = new Reel();
    originalreel.reelId = reelId;

    let user = new User();
    user.userId = userId;

    const { reel, mentions } = await this.createReel(
      userId,
      body,
      ReelType.Reply
    );
    reel.replyTo = originalreel;
    reel.type = ReelType.Reply;

    const savedreel = await reelReplyRepository.save(reel);

    const orgReeler = await userRepository.findOne({
      where: { reels: { reelId } },
      relations: { following: true },
    });

    if (
      orgReeler &&
      orgReeler.following.some((followee) => followee.userId === userId)
    ) {
      await socketService.emitNotification(
        userId,
        orgReeler.username,
        NotificationType.Reply_Reel,
        { replyId: savedreel.reelId }
      );
    }

    return {
      reelReply: {
        reelId,
        replyId: savedreel.reelId,
        reelurl: savedreel.reelUrl,
        content: savedreel.content,
        createdAt: savedreel.createdAt,
        mentions,
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
        ? fs.unlinkSync(`${process.env.DEV_MEDIA_PATH}/reels/${reel.reelUrl}`)
        : fs.unlinkSync(`${process.env.PROD_MEDIA_PATH}/reels/${reel.reelUrl}`);
    }

    await reelRepository.delete({ reelId });
  };

  getReelReplies = async (
    userId: number,
    reelId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const replies = await reelRepository.find({
      where: { replyTo: { reelId } },
      select: {
        reelUrl: true,
        reelId: true,
        content: true,
        createdAt: true,
        replyTo: {
          createdAt: true,
          reeler: {
            username: true,
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
        replyTo: { reeler: true },
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
      skip: (page - 1) * limit,
      take: limit,
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
          originalReeler: {
            username: reply.replyTo.reeler.username,
          },
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

  getReelReReelers = async (
    userId: number,
    reelId: number,
    page: number = 1,
    limit: number = 30
  ) => {
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
      skip: (page - 1) * limit,
      take: limit,
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
    lang: string = 'ar',
    page: number = 1,
    limit: number = 30
  ) => {
    const rereelRepository = AppDataSource.getRepository(Reel);

    const rereels = await rereelRepository.find({
      where: { rereelTo: { reelId }, type: ReelType.Quote },
      select: reelSelectOptions,
      relations: reelRelations,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      rereels: rereels.map((rereel) => filterReel(rereel, userId, lang)),
    };
  };

  getReelReacters = async (
    userId: number,
    reelId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reel = await reelRepository.findOne({
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

    if (!reel) throw new AppError('Reel not found', 404);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedReacters = reel.reacts
      .slice(startIndex, endIndex)
      .map((reacter) => getPartialUserProfile(reacter, userId));

    return {
      reacters: paginatedReacters,
      currentPage: page,
      totalPages: Math.ceil(reel.reacts.length / limit),
    };
  };

  getReel = async (userId: number, reelId: number, lang: string = 'ar') => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reel = await reelRepository.findOne({
      where: { reelId },
      select: reelSelectOptions,
      relations: reelRelations,
    });

    if (!reel) throw new AppError(`No reel found`, 400);

    return {
      reel: filterReel(reel, userId, lang),
    };
  };

  toggleReelReact = async (userId: number, reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);
    const userRepository = AppDataSource.getRepository(User);

    const reel = await reelRepository.findOne({
      where: { reelId },
      relations: ['reacts'],
    });

    if (!reel) throw new AppError('No reel found', 404);

    const userIndex = reel.reacts.findIndex((user) => user.userId === userId);

    if (userIndex !== -1) {
      reel.reacts.splice(userIndex, 1);
      await notificationService.deleteNotification(
        { reelId },
        NotificationType.React_Reel
      );
    } else {
      let user = new User();
      user.userId = userId;
      reel.reacts.push(user);

      const orgReeler = await userRepository.findOne({
        where: { reels: { reelId } },
        relations: { following: true },
      });

      if (
        orgReeler &&
        orgReeler.following.some((followee) => followee.userId === userId)
      ) {
        await socketService.emitNotification(
          userId,
          orgReeler.username,
          NotificationType.React_Reel,
          { reelId: reelId }
        );
      }
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
        await notificationService.deleteNotification(
          { rereelId: user.reels[reelIdx].reelId },
          NotificationType.Repost_Reel
        );
        return { rereel: {}, message: 'Repost deleted successfully' };
      }
    }

    const { reel } = await this.createReel(userId, body, type);
    reel.rereelTo = orgReel;

    const savedreel = await reelRepository.save(reel);

    const orgReeler = await userRepository.findOne({
      where: { reels: { reelId } },
      relations: { following: true },
    });

    if (
      orgReeler &&
      orgReeler.following.some((followee) => followee.userId === userId)
    ) {
      await socketService.emitNotification(
        userId,
        orgReeler.username,
        type === ReelType.Repost
          ? NotificationType.Repost_Reel
          : NotificationType.Quote_Reel,
        { rereelId: savedreel.reelId }
      );
    }

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

  getReelsSupportingTag = async (
    userId: number,
    tag: string,
    lang: string,
    page: number = 1,
    limit: number = 30
  ) => {
    const reels = await AppDataSource.getRepository(Reel).find({
      where: { tags: { tag } },
      select: reelSelectOptions,
      relations: reelRelations,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      reels: reels.map((reel) => filterReel(reel, userId, lang)),
    };
  };
}
