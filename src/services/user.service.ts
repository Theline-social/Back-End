import { ILike, Like, Not } from 'typeorm';
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
        reels: true,
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
        getPartialUserProfile(follower, userId)
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
        getPartialUserProfile(followee, userId)
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
        getPartialUserProfile(blocked, userId)
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
      muted: user?.muting.map((muted) => getPartialUserProfile(muted, userId)),
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
    lang: string = 'ar'
  ) => {
    const reelRepository = AppDataSource.getRepository(Reel);

    const reels = await reelRepository.find({
      where: { reeler: { username }, type: Not(ReelType.Reply) },
      select: reelSelectOptions,
      relations: reelRelations,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      reels: reels.map((reel) => filterReel(reel, userId, lang)),
    };
  };

  getUserTweets = async (userId: number, username: string) => {
    const tweetRepository = AppDataSource.getRepository(Tweet);

    const tweets = await tweetRepository.find({
      where: { tweeter: { username } },
      select: tweetSelectOptions,
      relations: tweetRelations,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      tweets: tweets.map((tweet) => filterTweet(tweet, userId)),
    };
  };
}
