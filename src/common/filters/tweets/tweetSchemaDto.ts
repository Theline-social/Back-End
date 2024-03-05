import { ProfileDto } from '../users/userDto';

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
      optionId: number;
      text: string;
      votesCount: number;
    }[];
    totalVotesCount: number;
    votedOptionId?: number;
  };
  tweeter: ProfileDto;
  originalTweeter?: ProfileDto;
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
        optionId: number;
        text: string;
        votesCount: number;
      }[];
      totalVotesCount: number;
      votedOptionId?: number;
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
