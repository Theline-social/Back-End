export const reelSelectOptions = {
  reelUrl: true,
  reelId: true,
  supportedTopics: true,
  content: true,
  createdAt: true,
  type: true,
  rereelTo: {
    reelUrl: true,
    reelId: true,
    content: true,
    createdAt: true,
    type: true,
    supportedTopics: true,
    reeler: {
      username: true,
      jobtitle: true,
      name: true,
      imageUrl: true,
      userId: true,
      bio: true,
    },
    mentions: {
      mentionedAt: true,
      userMentioned: { username: true },
    },
  },
  reeler: {
    username: true,
    jobtitle: true,
    name: true,
    imageUrl: true,
    userId: true,
    bio: true,
  },
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
  rereels: true,
};

export const reelRelations = {
  rereelTo: {
    supportedTopics: true,
    replies: true,
    reacts: true,
    rereels: { reeler: true },
    bookmarkedBy: true,
    reeler: {
      followers: true,
      following: true,
      blocked: true,
      muted: true,
    },
    mentions: { userMentioned: true },
  },
  supportedTopics: true,

  replies: true,
  reacts: true,
  reeler: {
    followers: true,
    following: true,
    blocked: true,
    muted: true,
  },
  rereels: { reeler: true },
  bookmarkedBy: true,
  mentions: { userMentioned: true },
};
