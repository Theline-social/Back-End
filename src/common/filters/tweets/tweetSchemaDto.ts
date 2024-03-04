export interface TweetAPISchemaDto {
  tweetId: number;
  media?: {
    url: string;
  }[];
  content: string;
  createdAt: Date;
  type: string;
  poll?: {
    pollId: number;
    question: string;
    length: Date;
    options: {
      text: string;
      votesCount: number;
    }[];
    totalVotesCount: number;
    votedOption?: number;
  };
  tweeter: {
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
  originalTweeter?: {
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
  originalTweet?: {
    tweetId: number;
    media?: {
      url: string;
    }[];
    content: string;
    createdAt: Date;
    type: string;
    poll?: {
      pollId: number;
      question: string;
      length: Date;
      options: {
        text: string;
        votesCount: number;
      }[];
      totalVotesCount: number;
      votedOption?: number;
    };
    mentions?: string[];
    reactCount: number;
    reTweetCount: number;
    repliesCount: number;
    isBookmarked: boolean;
    isReacted: boolean;
    isRetweeted: boolean;
  };
  mentions?: string[];
  reactCount: number;
  reTweetCount: number;
  repliesCount: number;
  isBookmarked: boolean;
  isReacted: boolean;
  isRetweeted: boolean;
}
