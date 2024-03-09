import { ProfileDto } from '../users/userDto';

export interface FilteredReelDto {
  reelId: number;
  reelUrl: string;
  content: string;
  createdAt: Date;
  type: string;
  topics: { topic: string; description: string }[];
  reeler: ProfileDto;
  originalReeler?: ProfileDto | { username: string };
  originalReel?: {
    reelId: number;
    reelUrl: string;
    content: string;
    createdAt: Date;
    type: string;
    topics: { topic: string; description: string }[];
    mentions?: string[];
    reactCount: number;
    reReelCount: number;
    repliesCount: number;
    isBookmarked: boolean;
    isReacted: boolean;
    isRereeled: boolean;
  };
  mentions?: string[];
  reactCount: number;
  reReelCount: number;
  repliesCount: number;
  isBookmarked: boolean;
  isReacted: boolean;
  isRereeled: boolean;
}
