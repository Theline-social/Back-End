import { ILike, In, Like, Not } from 'typeorm';
import {
  AppError,
  ChangePasswordBody,
  Password,
  emailRegex,
  filterTweet,
  filterUser,
  getPartialUserProfile,
  getFullUserProfile,
  isPhoneValid,
  editProfileBody,
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
import {
  OtpCodes,
  OtpProvider,
  Reel,
  ReelMention,
  ReelType,
  Tweet,
  TweetMention,
  TweetType,
  User,
} from '../entities';
import * as fs from 'fs';

export class UsersService {
  constructor() {}

  changeUsername = async (userId: number, body: { newUsername: string }) => {
    const userRepository = AppDataSource.getRepository(User);
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const reelRepository = AppDataSource.getRepository(Reel);
    const reelMentionRepository = AppDataSource.getRepository(ReelMention);

    const existingUser = await userRepository.findOne({
      where: { userId },
    });

    if (!existingUser) throw new AppError(`User ${userId} does not exist`, 404);

    const oldUsername = existingUser.username;
    existingUser.username = body.newUsername.replace('@', '');
    await userRepository.save(existingUser);

    const tweetsMention = await tweetMentionRepository.find({
      where: { userMentioned: { userId } },
      relations: { tweet: true },
    });

    let updatedTweets = [];
    for (const tweetMention of tweetsMention) {
      if (tweetMention.tweet.content) {

        const updatedContent = tweetMention.tweet.content.replace(
          new RegExp(`@${oldUsername}`, 'g'),
          `@${body.newUsername}`
        );
        
        const updatedTweet = { ...tweetMention.tweet, content: updatedContent };
        updatedTweets.push(updatedTweet);
      }
    }
    
    await tweetRepository.save(updatedTweets);

    const reelsMention = await reelMentionRepository.find({
      where: { userMentioned: { userId } },
      relations: { reel: true },
    });

    let updatedReels = [];
    for (const reelMention of reelsMention) {
      if (reelMention.reel.content) {
        const updatedContent = reelMention.reel.content.replace(
          new RegExp(`@${oldUsername}`, 'g'),
          `@${body.newUsername}`
        );
        const updatedReel = { ...reelMention.reel, content: updatedContent };
        updatedReels.push(updatedReel);
      }
    }
    await reelRepository.save(updatedReels);
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

  changeEmail = async (userId: number, body: { newEmail: string }) => {
    const otpCodesRepository = AppDataSource.getRepository(OtpCodes);
    const userRepository = AppDataSource.getRepository(User);

    const emailOtpCode = await otpCodesRepository.findOne({
      where: { input: body.newEmail, provider: OtpProvider.EMAIL },
    });
    if (!emailOtpCode) throw new AppError('Go to verifiy your email', 400);
    if (!emailOtpCode.isVerified) throw new AppError('Email not verified', 400);

    const user = await userRepository.findOne({
      where: { userId },
    });

    if (!user) throw new AppError('User not found', 404);

    user.email = body.newEmail;
    await userRepository.save(user);
  };

  changePhoneNumber = async (
    userId: number,
    body: { newPhoneNumber: string }
  ) => {
    const otpCodesRepository = AppDataSource.getRepository(OtpCodes);
    const userRepository = AppDataSource.getRepository(User);

    const phoneOtpCode = await otpCodesRepository.findOne({
      where: { input: body.newPhoneNumber, provider: OtpProvider.PHONE },
    });
    if (!phoneOtpCode)
      throw new AppError('Go to verifiy your phone number', 400);
    if (!phoneOtpCode.isVerified)
      throw new AppError('phone number not verified', 400);

    const user = await userRepository.findOne({
      where: { userId },
    });

    if (!user) throw new AppError('User not found', 404);

    user.phoneNumber = body.newPhoneNumber;
    await userRepository.save(user);
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

  savePhoto = async (userId: number, imageUrl: string) => {
    await AppDataSource.getRepository(User).update(
      { userId },
      {
        imageUrl,
      }
    );
  };

  getUserProfile = async (username: string, userId: number) => {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { username },
      select: {
        followers: { userId: true },
        following: { userId: true },
        blocked: { userId: true },
        blocking: { userId: true },
        muted: { userId: true },
        tweets: { tweetId: true },
        reels: { reelId: true },
      },
      relations: {
        followers: true,
        following: true,
        blocked: true,
        muted: true,
        tweets: true,
        blocking: true,
        reels: true,
      },
    });

    if (!user) throw new AppError('user not found', 404);

    return { user: getFullUserProfile(user, userId) };
  };

  getTweetBookmarks = async (
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
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

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const bookmarks = user.tweetBookmarks
      .slice(startIndex, endIndex)
      .map((tweet) => filterTweet(tweet, userId));

    return {
      bookmarks,
      currentPage: page,
      totalPages: Math.ceil(user.tweetBookmarks.length / limit),
    };
  };

  getTweetMentions = async (
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: { blocking: { userId: true } },
      relations: { blocking: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const blockingsIds = user.blocking.map((blocking) => blocking.userId);

    if (blockingsIds.includes(userId)) return { reels: [] };

    const mentions = await tweetMentionRepository.find({
      where: {
        userMentioned: user,
        userMakingMention: { userId: Not(In([...blockingsIds])) },
      },
      select: {
        tweet: tweetSelectOptions,
      },
      relations: {
        tweet: tweetRelations,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      mentions: mentions.map((mention) => filterTweet(mention.tweet, userId)),
    };
  };

  getReelBookmarks = async (
    userId: number,
    lang: string = 'ar',
    page: number = 1,
    limit: number = 30
  ) => {
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

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const bookmarks = user.reelBookmarks
      .slice(startIndex, endIndex)
      .map((reel) => filterReel(reel, userId, lang));

    return {
      bookmarks,
      currentPage: page,
      totalPages: Math.ceil(user.reelBookmarks.length / limit),
    };
  };

  getReelMentions = async (
    userId: number,
    lang: string = 'ar',
    page: number = 1,
    limit: number = 30
  ) => {
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
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      mentions: mentions.map((mention) =>
        filterReel(mention.reel, userId, lang)
      ),
    };
  };

  getFollowers = async (
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
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

    if (!user?.followers) return { followers: [] };

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const followers = user.followers
      .slice(startIndex, endIndex)
      .map((follower) => getPartialUserProfile(follower, userId));

    return {
      followers,
      currentPage: page,
      totalPages: Math.ceil(user.followers.length / limit),
    };
  };

  getFollowings = async (
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
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

    if (!user?.following) return { followings: [] };

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const followings = user.following
      .slice(startIndex, endIndex)
      .map((followee) => getPartialUserProfile(followee, userId));

    return {
      followings,
      currentPage: page,
      totalPages: Math.ceil(user.following.length / limit),
    };
  };

  getBlocked = async (userId: number, page: number = 1, limit: number = 30) => {
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

    if (!user?.blocking) return { blocked: [] };

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const blocked = user.blocking
      .slice(startIndex, endIndex)
      .map((blockedUser) => getPartialUserProfile(blockedUser, userId));

    return {
      blocked,
      currentPage: page,
      totalPages: Math.ceil(user.blocking.length / limit),
    };
  };

  getMuted = async (userId: number, page: number = 1, limit: number = 30) => {
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

    if (!user?.muting) return { muted: [] };

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const muted = user.muting
      .slice(startIndex, endIndex)
      .map((mutedUser) => getPartialUserProfile(mutedUser, userId));

    return {
      muted,
      currentPage: page,
      totalPages: Math.ceil(user.muting.length / limit),
    };
  };

  search = async (
    userId: number,
    nameorusernametosearch: string,
    page: number = 1,
    limit: number = 30
  ) => {
    const userRepository = AppDataSource.getRepository(User);

    const users = await userRepository.find({
      where: [
        { name: ILike(`%${nameorusernametosearch.toLowerCase()}%`) },
        { username: ILike(`%${nameorusernametosearch.toLowerCase()}%`) },
      ],
      relations: {
        followers: true,
        following: true,
        blocked: true,
        muted: true,
      },
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      users: users.map((user) => getPartialUserProfile(user, userId)),
    };
  };

  editUserProfile = async (userId: number, body: editProfileBody) => {
    const userProfileRepository = AppDataSource.getRepository(User);

    let userProfile = await userProfileRepository.findOne({
      where: { userId },
      relations: { followers: true, following: true },
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    if (body.imageUrl !== undefined) {
      if (userProfile.imageUrl !== 'default.jpeg')
        process.env.NODE_ENV !== 'production'
          ? fs.unlinkSync(
              `${process.env.DEV_MEDIA_PATH}/users/${userProfile.imageUrl}`
            )
          : fs.unlinkSync(
              `${process.env.PROD_MEDIA_PATH}/users/${userProfile.imageUrl}`
            );

      userProfile.imageUrl = body.imageUrl;
    }
    if (body.bannerUrl !== undefined) {
      if (userProfile.bannerUrl !== 'banner_default2.jpeg')
        process.env.NODE_ENV !== 'production'
          ? fs.unlinkSync(
              `${process.env.DEV_MEDIA_PATH}/users/${userProfile.bannerUrl}`
            )
          : fs.unlinkSync(
              `${process.env.PROD_MEDIA_PATH}/users/${userProfile.bannerUrl}`
            );
      userProfile.bannerUrl = body.bannerUrl;
    }
    if (body.name !== undefined) {
      userProfile.name = body.name;
    }
    if (body.bio !== undefined) {
      userProfile.bio = body.bio;
    }
    if (body.location !== undefined) {
      userProfile.location = body.location;
    }
    if (body.jobtitle !== undefined) {
      userProfile.jobtitle = body.jobtitle;
    }
    if (body.dateOfBirth !== undefined) {
      userProfile.dateOfBirth = body.dateOfBirth;
    }

    const saveduser = await userProfileRepository.save(userProfile);

    return { user: filterUser(saveduser) };
  };

  getUserReels = async (
    userId: number,
    username: string,
    lang: string = 'ar',
    page: number = 1,
    limit: number = 30
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { username },
      select: { blocking: { userId: true } },
      relations: { blocking: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const blockingsIds = user.blocking.map((blocking) => blocking.userId);

    if (blockingsIds.includes(userId)) return { reels: [] };

    const reels = await reelRepository.find({
      where: { reeler: { username }, type: Not(ReelType.Reply) },
      select: reelSelectOptions,
      relations: reelRelations,
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      reels: reels.map((reel) => filterReel(reel, userId, lang)),
    };
  };

  getUserTweets = async (
    userId: number,
    username: string,
    page: number = 1,
    limit: number = 30
  ) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { username },
      select: { blocking: { userId: true } },
      relations: { blocking: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const blockingsIds = user.blocking.map((blocking) => blocking.userId);

    if (blockingsIds.includes(userId)) return { tweets: [] };

    const tweets = await tweetRepository.find({
      where: { tweeter: { username } },
      select: tweetSelectOptions,
      relations: tweetRelations,
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      tweets: tweets.map((tweet) => filterTweet(tweet, userId)),
    };
  };
}
