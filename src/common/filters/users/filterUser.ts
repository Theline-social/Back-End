import { User } from '../../../entities';
import { ProfileDto, userDto } from './userDto';

export const filterUser = (user: User): userDto => {
  return {
    userId: user.userId,
    imageUrl: user.imageUrl,
    username: user.username,
    jobtitle: user.jobtitle,
    name: user.name,
    bio: user.bio,
    email: user.email,
    phoneNumber: user.phoneNumber,
    location: user.location,
    bannerUrl: user.bannerUrl,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    subscriptionType: user.subscriptionType,
    followersCount: user.followersCount,
    followingsCount: user.followingsCount,
  };
};

export const getPartialUserProfile = (
  user: User,
  userId: number
): ProfileDto => {
  return {
    userId: user.userId,
    imageUrl: user.imageUrl,
    username: user.username,
    jobtitle: user.jobtitle,
    name: user.name,
    bio: user.bio,
    followersCount: user.followersCount,
    followingsCount: user.followingsCount,
    subscriptionType: user.subscriptionType,
    isMuted: user.isMutedBy(userId),
    isBlocked: user.isBlockedBy(userId),
    isFollowed: user.isFollowedBy(userId),
  };
};

export const getFullUserProfile = (
  user: User,
  userId: number
): userDto & {
  isMuted: boolean;
  isBlocked: boolean;
  isBlocking: boolean;
  isFollowed: boolean;
  postsCount: number;
} => {
  return {
    userId: user.userId,
    imageUrl: user.imageUrl,
    username: user.username,
    jobtitle: user.jobtitle,
    name: user.name,
    bio: user.bio,
    email: user.email,
    phoneNumber: user.phoneNumber,
    location: user.location,
    bannerUrl: user.bannerUrl,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    subscriptionType: user.subscriptionType,
    followersCount: user.followersCount,
    followingsCount: user.followingsCount,
    isMuted: user.isMutedBy(userId),
    isBlocked: user.isBlockedBy(userId),
    isBlocking: user.isBlocking(userId),
    isFollowed: user.isFollowedBy(userId),
    postsCount: user.postsCount,
  };
};
