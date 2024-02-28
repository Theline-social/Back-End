import { In } from 'typeorm';
import { AppError, usernameRegex } from '../common';
import { AppDataSource } from '../dataSource';
import {
  ReReel,
  Reel,
  ReelMention,
  ReelReply,
  ReelReplyMention,
  Topic,
  User,
} from '../entities';
import socketService from './socket.service';

export class ReelsService {
  constructor() {}

  addReel = async (
    userId: number,
    reelUrl: string,
    body: { content: string; topics: string[] }
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
    reel.reelUrl = reelUrl;
    reel.reeler = user;
    reel.supportedTopics = supportedtopics;

    await reelRepository.save(reel);

    let usernames = (body.content.match(usernameRegex) as Array<string>) || [];

    if (!usernames) return;

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
    const reelReplyRepository = AppDataSource.getRepository(ReelReply);

    const replies = await reelReplyRepository.find({
      where: { reel: { reelId } },
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
      relations: { reacts: true, mentions: true, parentReply: true },
    });

    const topLevelReplies = replies.filter(
      (reply) => reply.parentReply === null
    );

    return {
      replies: topLevelReplies.map((reply) => {
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

  getReelReReelers = async (id: number) => {
    const rereelRepository = AppDataSource.getRepository(ReReel);

    const rereels = await rereelRepository.find({
      where: { reel: { reelId: id } },
      select: {
        user: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: { user: true },
    });

    return {
      rereelers: rereels.map((rereel) => rereel.user),
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
    body: { content: string }
  ) => {
    const reelReplyRepository = AppDataSource.getRepository(ReelReply);
    const userRepository = AppDataSource.getRepository(User);
    const reelReplyMentionRepository =
      AppDataSource.getRepository(ReelReplyMention);

    let reel = new Reel();
    reel.reelId = reelId;

    let user = new User();
    user.userId = userId;

    const reelReply = new ReelReply();
    reelReply.content = body.content;
    reelReply.user = user;
    reelReply.reel = reel;

    await reelReplyRepository.save(reelReply);

    let usernames = body.content.match(usernameRegex) as Array<string>;

    if (usernames) {
      usernames = usernames.map((username) => username.replace('@', ''));

      const users = await userRepository.find({
        where: { username: In([...usernames]) },
      });

      let replyMentions: ReelReplyMention[] = [];

      replyMentions = users.map((mentioned) => {
        let newReelMention = new ReelReplyMention();

        newReelMention.reply = reelReply;
        newReelMention.userMakingMention = user;
        newReelMention.userMentioned = mentioned;
        return newReelMention;
      });

      await reelReplyMentionRepository.insert(replyMentions);
    }
    return { reelReply };
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

  addReplyToReply = async (
    userId: number,
    reelId: number,
    replyReelId: number,
    body: { content: string }
  ) => {
    const reelReplyRepository = AppDataSource.getRepository(ReelReply);
    const userRepository = AppDataSource.getRepository(User);
    const reelReplyMentionRepository =
      AppDataSource.getRepository(ReelReplyMention);

    const user = new User();
    user.userId = userId;

    let reel = new Reel();
    reel.reelId = reelId;

    let parentReply = new ReelReply();
    parentReply.replyId = replyReelId;

    const newreelReply = new ReelReply();
    newreelReply.content = body.content;
    newreelReply.user = user;
    newreelReply.reel = reel;
    newreelReply.parentReply = parentReply;

    await reelReplyRepository.save(newreelReply);

    let usernames = (body.content.match(usernameRegex) as Array<string>) || [];

    if (usernames) {
      usernames = usernames.map((username) => username.replace('@', ''));

      const users = await userRepository.find({
        where: { username: In([...usernames]) },
      });

      let replyMentions: ReelReplyMention[] = [];

      replyMentions = users.map((mentioned) => {
        let newReelMention = new ReelReplyMention();

        newReelMention.reply = newreelReply;
        newReelMention.userMakingMention = user;
        newReelMention.userMentioned = mentioned;
        return newReelMention;
      });

      await reelReplyMentionRepository.insert(replyMentions);
    }
  };

  toggleReplyReact = async (
    userId: number,
    reelId: number,
    replyId: number
  ) => {
    const reelReplyRepository = AppDataSource.getRepository(ReelReply);

    const reelReply = await reelReplyRepository.findOne({
      where: { replyId },
      relations: ['reacts'],
    });

    if (!reelReply) throw new AppError('No reel reply found', 404);

    const userIndex = reelReply.reacts.findIndex(
      (user) => user.userId === userId
    );

    if (userIndex !== -1) {
      reelReply.reacts.splice(userIndex, 1);
    } else {
      let user = new User();
      user.userId = userId;
      reelReply.reacts.push(user);
    }

    await reelReplyRepository.save(reelReply);
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
    rereel.user = user;
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
