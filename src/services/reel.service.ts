import { In } from 'typeorm';
import { AppError, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import { ReReel, Reel, ReelMention, Topic, User } from '../entities';
import socketService from './socket.service';

export class ReelsService {
  constructor() {}

  addReel = async (
    userId: number,
    body: { content: string; reelUrl: string;  topics: string[] }
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);
    const userRepository = AppDataSource.getRepository(User);
    const topicRepository = AppDataSource.getRepository(Topic);
    const reelMentionRepository = AppDataSource.getRepository(ReelMention);

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
    reel.reelUrl = body.reelUrl;
    reel.reeler = user;
    reel.supportedTopics = supportedtopics;

    await reelRepository.save(reel);

    let usernames = (body.content.match(usernameRegex) as Array<string>) || [];

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

    return { reel };
  };

  async exists(id: number) {
    const reelRepository = AppDataSource.getRepository(Reel);

    return await reelRepository.exists({ where: { reelId: id } });
  }

  deleteReel = async (id: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    await reelRepository.delete(id);
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
        replies: true,
        reacts: true,
        reeler: {
          followers: true,
          following: true,
          blocked: true,
          muted: true,
        },
        rereels: { rereeler: true },
        bookmarkedBy: true,
        mentions: { userMentioned: true },
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
        const isTweeterBlocked = reply.reeler.blocked.some(
          (user: User) => user.userId === userId
        );
        const isTweeterMuted = reply.reeler.muted.some(
          (user: User) => user.userId === userId
        );
        const isTweeterFollowed = reply.reeler.followers.some(
          (user: User) => user.userId === userId
        );
        const isRetweeted = reply.rereels.some(
          (retweet: ReReel) => retweet.rereeler.userId === userId
        );

        return {
          replyId: reply.reelId,
          reelUrl: reply.reelUrl,
          content: reply.content,
          createdAt: reply.createdAt,
          replier: {
            imageUrl: reply.reeler.imageUrl,
            username: reply.reeler.username,
            jobtitle: reply.reeler.jobtitle,
            name: reply.reeler.name,
            bio: reply.reeler.bio,
            followersCount: reply.reeler.followers.length,
            followingsCount: reply.reeler.following.length,
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
          reTweetCount: reply.reReelCount,
          repliesCount: reply.repliesCount,
          isBookmarked,
          isReacted,
          isRetweeted,
        };
      }),
    };
  };

  getReelReReelers = async (id: number) => {
    const rereelRepository = AppDataSource.getRepository(ReReel);

    const rereels = await rereelRepository.find({
      where: { reel: { reelId: id } },
      select: {
        rereeler: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: { rereeler: true },
    });

    return {
      rereelers: rereels.map((rereel) => rereel.rereeler),
    };
  };

  getReelReacters = async (id: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reels = await reelRepository.findOne({
      where: { reelId: id },
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
      relations: { reacts: true },
    });

    return {
      reacters: reels?.reacts,
    };
  };

  getReel = async (userId: number, reelId: number) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reel = await reelRepository.findOne({
      where: { reelId },
      select: {
        mentions: {
          mentionedAt: true,
        },
        reeler: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
        replies: false,
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
      },
      relations: {
        replies: true,
        reacts: true,
        reeler: true,
        rereels: true,
        supportedTopics: true,
        bookmarkedBy: true,
        mentions: { userMentioned: true },
      },
    });

    if (!reel) throw new AppError(`No reel found`, 400);

    const isBookmarked = reel.bookmarkedBy.some(
      (user: User) => user.userId === userId
    );

    const isReacted = reel.reacts.some((user: User) => user.userId === userId);

    return {
      reel: {
        ...reel,
        reactCount: reel?.reactCount,
        reReelCount: reel?.reReelCount,
        bookmarksCount: reel?.bookmarksCount,
        repliesCount: reel?.repliesCount,
        isBookmarked,
        isReacted,
      },
    };
  };

  addReelReply = async (
    userId: number,
    reelId: number,
    body: { content: string, topics: string[], reelUrl: string}
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    let orgreel = new Reel();
    orgreel.reelId = reelId;

    let user = new User();
    user.userId = userId;
    const { reel } = await this.addReel(userId, body);

    reel.replyTo = orgreel;
    await reelRepository.save(reel);

    return { reelReply: reel };
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

  addReReel = async (
    userId: number,
    reelId: number,
    body: { quote: string }
  ) => {
    const rereelRepository = AppDataSource.getRepository(ReReel);

    const reel = new Reel();
    reel.reelId = reelId;

    const user = new User();
    user.userId = userId;

    const rereel = new ReReel();
    rereel.rereeler = user;
    rereel.reel = reel;
    rereel.quote = body.quote;

    await rereelRepository.save(rereel);

    return { rereel };
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
