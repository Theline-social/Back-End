import { User } from '../../../entities';
import { userDto } from './userDto';

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
    followersCount: user.followersCount,
    followingsCount: user.followingsCount,
  };
};
