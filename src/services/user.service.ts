import {
  AppError,
  ChangePasswordBody,
  Password,
  emailRegex,
  filterTweet,
  filterUser,
  filterUserProfile,
  getFullUserProfile,
  isPhoneValid,
} from '../common';
import { filterReel } from '../common/filters/reels/filterReel';
import {
  reelRelations,
  reelSelectOptions,
} from '../common/filters/reels/reelSelectOptions';
import {
  tweetRelations,
  tweetSelectOptions,
} from '../common/filters/tweets/tweetSelectOptions';
import { userProfileSelectOptions } from '../common/filters/users/userSelectOptions';
import { AppDataSource } from '../dataSource';
import { ReelMention, TweetMention, User } from '../entities';

export class UsersService {
  constructor() {}

  changeUsername = async (userId: number, body: { newUsername: string }) => {
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { userId },
    });

    if (!existingUser) throw new AppError(`User ${userId} does not exist`, 404);

    existingUser.username = body.newUsername.replace('@', '');
    await userRepository.save(existingUser);
  };

  changePassword = async (userId: number, body: ChangePasswordBody) => {
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { userId },
    });

    if (!existingUser) throw new AppError(`User ${userId} does not exist`, 404);

    const isCorrectPassword = await Password.comparePassword(
      body.currPassword,
      existingUser.password
    );

    if (!isCorrectPassword) throw new AppError('Wrong Current Password', 400);

    const hashedPassword = await Password.hashPassword(body.newPassword);
    existingUser.password = hashedPassword;
    await userRepository.save(existingUser);
  };

  currentAuthedUser = async (userId: number) => {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { userId },
    });

    return { user };
  };

  resetPassword = async (userId: number, body: { newPassword: string }) => {
    const { newPassword } = body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
    });

    if (!user) throw new AppError('User not found', 404);

    const hashedPassword = await Password.hashPassword(newPassword);

    user.password = hashedPassword;
    await userRepository.save(user);
  };

  isUserFoundById = async (userId: number) => {
    return await AppDataSource.getRepository(User).existsBy({ userId });
  };

  isUserFoundByUsername = async (username: string) => {
    return await AppDataSource.getRepository(User).existsBy({ username });
  };

  isUserFound = async (body: { input: string }) => {
    const { input } = body;
    let user: User | null = null;
    const userRepository = AppDataSource.getRepository(User);

    if (input.match(emailRegex)) {
      user = await userRepository.findOne({
        where: { email: input.toLowerCase() },
        select: { email: true, phoneNumber: true, name: true },
      });
    } else if (isPhoneValid(input)) {
      user = await userRepository.findOne({
        where: { phoneNumber: input },
        select: { email: true, phoneNumber: true, name: true },
      });
    } else {
      user = await userRepository.findOne({
        where: { username: input },
        select: { email: true, phoneNumber: true, name: true },
      });
    }

    return {
      isFound: user !== null,
      data: {
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        name: user?.name,
      },
    };
  };

  getUserProfile = async (username: string, userId: number) => {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { username },
      relations: {
        followers: true,
        following: true,
        blocked: true,
        muted: true,
      },
    });

    if (!user) throw new AppError('user not found', 404);

    return { user: getFullUserProfile(user, userId) };
  };

  getTweetBookmarks = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: {
        tweetBookmarks: tweetSelectOptions,
      },
      relations: {
        tweetBookmarks: tweetRelations,
      },
    });

    if (!user?.tweetBookmarks) return { bookmarks: [] };

    return {
      bookmarks: user.tweetBookmarks.map((tweet) => filterTweet(tweet, userId)),
    };
  };

  getTweetMentions = async (userId: number) => {
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);

    const user = new User();
    user.userId = userId;

    const mentions = await tweetMentionRepository.find({
      where: { userMentioned: user },
      select: {
        tweet: tweetSelectOptions,
      },
      relations: {
        tweet: tweetRelations,
      },
    });

    return {
      mentions: mentions.map((mention) => filterTweet(mention.tweet, userId)),
    };
  };

  getReelBookmarks = async (userId: number, lang: string = 'ar') => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: {
        reelBookmarks: reelSelectOptions,
      },
      relations: {
        reelBookmarks: reelRelations,
      },
    });

    if (!user?.reelBookmarks) return { bookmarks: [] };

    return {
      bookmarks: user.reelBookmarks.map((reel) =>
        filterReel(reel, userId, lang)
      ),
    };
  };

  getReelMentions = async (userId: number, lang: string = 'ar') => {
    const reelMentionRepository = AppDataSource.getRepository(ReelMention);

    const user = new User();
    user.userId = userId;

    const mentions = await reelMentionRepository.find({
      where: { userMentioned: user },
      select: {
        reel: reelSelectOptions,
      },
      relations: {
        reel: reelRelations,
      },
    });

    return {
      mentions: mentions.map((mention) =>
        filterReel(mention.reel, userId, lang)
      ),
    };
  };

  getFollowers = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      select: {
        followers: userProfileSelectOptions,
      },
      relations: {
        followers: {
          blocked: true,
          muted: true,
          followers: true,
          following: true,
        },
      },
    });

    return {
      followers: user?.followers.map((follower) =>
        filterUserProfile(follower, userId)
      ),
    };
  };

  getFollowings = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      select: {
        following: userProfileSelectOptions,
      },
      relations: {
        following: {
          blocked: true,
          muted: true,
          followers: true,
          following: true,
        },
      },
    });

    return {
      followings: user?.following.map((followee) =>
        filterUserProfile(followee, userId)
      ),
    };
  };

  getBlocked = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      select: {
        blocking: userProfileSelectOptions,
      },
      relations: {
        blocking: {
          blocked: true,
          muted: true,
          followers: true,
          following: true,
        },
      },
    });

    return {
      blocked: user?.blocking.map((blocked) =>
        filterUserProfile(blocked, userId)
      ),
    };
  };

  getMuted = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      select: {
        muting: userProfileSelectOptions,
      },
      relations: {
        muting: {
          blocked: true,
          muted: true,
          followers: true,
          following: true,
        },
      },
    });

    return {
      muted: user?.muting.map((muted) => filterUserProfile(muted, userId)),
    };
  };
}
