import {
  AppError,
  ChangePasswordBody,
  Password,
  emailRegex,
  isPhoneValid,
} from '../common';
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

  isUserFound = async (body: { input: string }) => {
    const { input } = body;
    let user: User | null = null;
    const userRepository = AppDataSource.getRepository(User);

    if (input.match(emailRegex)) {
      user = await userRepository.findOne({
        where: { email: input },
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

  getFollowers = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      select: {
        followers: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: { followers: true },
    });

    return { followers: user?.followers };
  };

  getFollowings = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      select: {
        following: {
          email: true,
          username: true,
          jobtitle: true,
          name: true,
          imageUrl: true,
          userId: true,
        },
      },
      relations: { following: true },
    });

    return { followings: user?.following };
  };

  getTweetBookmarks = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: {
        tweetBookmarks: {
          content: true,
          gifUrl: true,
          createdAt: true,
          imageUrls: true,
          tweeter: {
            email: true,
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
          },
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
          poll: {
            question: true,
            length: true,
            options: {
              text: true,
              voters: {
                userId: true,
                email: true,
                username: true,
                jobtitle: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      relations: {
        tweetBookmarks: {
          tweeter: true,
          mentions: { userMentioned: true },
          reacts: true,
          bookmarkedBy: true,
          replies: true,
          retweets: true,
          poll: { options: { voters: true } },
        },
      },
    });

    if (!user?.reelBookmarks) return { tweetBookmarks: [] };

    return {
      bookmarks: user.tweetBookmarks.map((tweet) => {
        return {
          ...tweet,
          reactCount: tweet.reactCount,
          reTweetCount: tweet.reTweetCount,
          bookmarksCount: tweet.bookmarksCount,
          repliesCount: tweet.repliesCount,
        };
      }),
    };
  };

  getTweetMentions = async (userId: number) => {
    const tweetMentionRepository = AppDataSource.getRepository(TweetMention);

    const user = new User();
    user.userId = userId;

    const mentions = await tweetMentionRepository.find({
      where: { userMentioned: user },
      select: {
        tweet: {
          content: true,
          gifUrl: true,
          createdAt: true,
          imageUrls: true,
          tweeter: {
            email: true,
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
          },
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
          poll: {
            question: true,
            length: true,
            options: {
              text: true,
              voters: {
                userId: true,
                email: true,
                username: true,
                jobtitle: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      relations: {
        tweet: {
          tweeter: true,
          reacts: true,
          bookmarkedBy: true,
          mentions: { userMentioned: true },
          replies: true,
          retweets: true,
          poll: { options: { voters: true } },
        },
      },
    });

    return {
      mentions: mentions.map((mention) => {
        return {
          ...mention.tweet,
          reactCount: mention.tweet?.reactCount,
          reTweetCount: mention.tweet?.reTweetCount,
          bookmarksCount: mention.tweet?.bookmarksCount,
          repliesCount: mention.tweet?.repliesCount,
        };
      }),
    };
  };

  getReelBookmarks = async (userId: number) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: {
        reelBookmarks: {
          content: true,
          reelUrl: true,
          createdAt: true,
          reeler: {
            email: true,
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
          },
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
        },
      },
      relations: {
        reelBookmarks: {
          reeler: true,
          rereels: true,
          mentions: { userMentioned: true },
          bookmarkedBy: true,
          reacts: true,
          replies: true,
        },
      },
    });

    if (!user?.reelBookmarks) return { bookmarks: [] };

    return {
      bookmarks: user.reelBookmarks.map((tweet) => {
        return {
          ...tweet,
          reactCount: tweet.reactCount,
          reTweetCount: tweet.reReelCount,
          bookmarksCount: tweet.bookmarksCount,
          repliesCount: tweet.repliesCount,
        };
      }),
    };
  };

  getReelMentions = async (userId: number) => {
    const reelMentionRepository = AppDataSource.getRepository(ReelMention);

    const user = new User();
    user.userId = userId;

    const mentions = await reelMentionRepository.find({
      where: { userMentioned: user },
      select: {
        reel: {
          content: true,
          reelUrl: true,
          createdAt: true,
          reeler: {
            email: true,
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
          },
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
        },
      },
      relations: {
        reel: {
          reeler: true,
          reacts: true,
          bookmarkedBy: true,
          replies: true,
          mentions: { userMentioned: true },
          rereels: true,
        },
      },
    });

    return {
      mentions: mentions.map((mention) => {
        return {
          ...mention.reel,
          reactCount: mention.reel?.reactCount,
          reTweetCount: mention.reel?.reReelCount,
          bookmarksCount: mention.reel?.bookmarksCount,
          repliesCount: mention.reel?.repliesCount,
        };
      }),
    };
  };
}
