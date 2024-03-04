interface FilteredReelDto {
  reelId: number;
  reelUrl: string;
  content: string;
  createdAt: Date;
  type: string;
  topics: { topic: string; description: string }[];
  reeler: {
    userId: number;
    imageUrl: string;
    username: string;
    jobtitle: string;
    name: string;
    bio: string;
    followersCount: number;
    followingsCount: number;
    isMuted: boolean;
    isBlocked: boolean;
    isFollowed: boolean;
  };
  originalReeler?: {
    userId: number;
    imageUrl: string;
    username: string;
    jobtitle: string;
    name: string;
    bio: string;
    followersCount: number;
    followingsCount: number;
    isMuted: boolean;
    isBlocked: boolean;
    isFollowed: boolean;
  };
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
