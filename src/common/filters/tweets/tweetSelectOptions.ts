import { userProfileSelectOptions } from '../users/userSelectOptions';

export const tweetSelectOptions = {
  tweetId: true,
  media: true,
  content: true,
  createdAt: true,
  type: true,
  retweetTo: {
    tweetId: true,
    media: true,
    content: true,
    createdAt: true,
    type: true,
    tweeter: userProfileSelectOptions,
    poll: {
      pollId: true,
      question: true,
      length: true,
      options: {
        optionId: true,
        text: true,
        voters: userProfileSelectOptions,
      },
    },
    mentions: {
      mentionedAt: true,
      userMentioned: { username: true },
    },
  },
  tweeter: userProfileSelectOptions,
  mentions: {
    mentionedAt: true,
    userMentioned: { username: true },
  },
  reacts: {
    userId: true,
  },
  bookmarkedBy: {
    userId: true,
  },
  retweets: true,
  poll: {
    pollId: true,
    question: true,
    length: true,
    options: {
      optionId: true,
      text: true,
      voters: userProfileSelectOptions,
    },
  },
};

export const tweetRelations = {
  retweetTo: {
    media: true,
    replies: true,
    reacts: true,
    retweets: { tweeter: true },
    bookmarkedBy: true,
    tweeter: {
      followers: true,
      following: true,
      blocked: true,
      muted: true,
    },
    mentions: { userMentioned: true },
    poll: { options: { voters: true } },
  },
  media: true,
  replies: true,
  reacts: true,
  tweeter: {
    followers: true,
    following: true,
    blocked: true,
    muted: true,
  },
  retweets: { tweeter: true },
  bookmarkedBy: true,
  mentions: { userMentioned: true },
  poll: { options: { voters: true } },
};
