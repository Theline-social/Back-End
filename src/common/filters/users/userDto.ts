import { Gender } from '../../../entities';

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
  followersCount: number;
  followingsCount: number;
}
