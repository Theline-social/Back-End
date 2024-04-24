import { Gender, SubscriptionType } from '../../../entities';

export interface userDto {
  userId: number;
  imageUrl: string;
  username: string;
  jobtitle: string;
  name: string;
  bio: string;
  email: string;
  phoneNumber: string;
  location: string;
  bannerUrl: string;
  dateOfBirth: Date;
  gender: Gender;
  createdAt: Date;
  updatedAt: Date;
  subscriptionType: SubscriptionType;
  followersCount: number;
  followingsCount: number;
}

export interface ProfileDto {
  userId: number;
  imageUrl: string;
  username: string;
  jobtitle: string;
  name: string;
  bio: string;
  subscriptionType: SubscriptionType;
  followersCount: number;
  followingsCount: number;
  isMuted: boolean;
  isBlocked: boolean;
  isFollowed: boolean;
}
