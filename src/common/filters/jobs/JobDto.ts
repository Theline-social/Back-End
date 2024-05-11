import { ProfileDto } from '../users/userDto';

export interface JobDto {
  jobId: number;
  topic: string;
  description: string;
  media?: {
    url: string;
  }[];
  createdAt: Date;
  isBookmarked: boolean;
  remainingDays: number;
  remainingApplications: number;
  applicantsCount: number;
  bookmarksCount: number;
  poster: ProfileDto;
}
