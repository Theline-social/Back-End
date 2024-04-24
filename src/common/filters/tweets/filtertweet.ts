import { Tweet } from '../../../entities';
import { TweetAPISchemaDto } from './tweetSchemaDto';

export const filterTweet = (
  tweet: Tweet,
  userId: number
): TweetAPISchemaDto => {
  return {
    tweetId: tweet.tweetId,
    media: tweet.media,
    content: tweet.content,
    createdAt: tweet.createdAt,
    type: tweet.type,
    poll: tweet.poll
      ? {
          pollId: tweet.poll.pollId,
          question: tweet.poll.question,
          length: tweet.poll.length,
          options: tweet.poll.options.map((option) => ({
            optionId: option.optionId,
            text: option.text,
            votesCount: option.voters.length,
          })),
          totalVotesCount: tweet.poll.totalVoters,
          votedOptionId: tweet.poll.getVotedOptionBy(userId),
        }
      : undefined,
    mentions: tweet.mentions
      ? tweet.mentions.map((mention) => mention.userMentioned.username)
      : undefined,
    reactCount: tweet.reactCount,
    reTweetCount: tweet.reTweetCount,
    repliesCount: tweet.repliesCount,
    isBookmarked: tweet.isBookmarkedBy(userId),
    isReacted: tweet.isReactedBy(userId),
    isRetweeted: tweet.isRetweetedBy(userId),
    tweeter: {
      userId: tweet.tweeter.userId,
      imageUrl: tweet.tweeter.imageUrl,
      username: tweet.tweeter.username,
      jobtitle: tweet.tweeter.jobtitle,
      name: tweet.tweeter.name,
      bio: tweet.tweeter.bio,
      followersCount: tweet.tweeter.followersCount,
      followingsCount: tweet.tweeter.followingsCount,
      subscriptionType: tweet.tweeter.subscriptionType,
      isMuted: tweet.tweeter.isMutedBy(userId),
      isBlocked: tweet.tweeter.isBlockedBy(userId),
      isFollowed: tweet.tweeter.isFollowedBy(userId),
    },
    originalTweeter: tweet.retweetTo
      ? {
          userId: tweet.retweetTo.tweeter.userId,
          imageUrl: tweet.retweetTo.tweeter.imageUrl,
          username: tweet.retweetTo.tweeter.username,
          jobtitle: tweet.retweetTo.tweeter.jobtitle,
          name: tweet.retweetTo.tweeter.name,
          bio: tweet.retweetTo.tweeter.bio,
          followersCount: tweet.retweetTo.tweeter.followersCount,
          followingsCount: tweet.retweetTo.tweeter.followingsCount,
          isMuted: tweet.retweetTo.tweeter.isMutedBy(userId),
          isBlocked: tweet.retweetTo.tweeter.isBlockedBy(userId),
          isFollowed: tweet.retweetTo.tweeter.isFollowedBy(userId),
        }
      : tweet.replyTo
      ? {
          username: tweet.replyTo.tweeter.username,
        }
      : undefined,
    originalTweet: tweet.retweetTo
      ? {
          tweetId: tweet.retweetTo.tweetId,
          media: tweet.retweetTo.media,
          content: tweet.retweetTo.content,
          createdAt: tweet.retweetTo.createdAt,
          type: tweet.retweetTo.type,
          poll: tweet.retweetTo.poll
            ? {
                pollId: tweet.retweetTo.poll.pollId,
                question: tweet.retweetTo.poll.question,
                length: tweet.retweetTo.poll.length,
                options: tweet.retweetTo.poll.options.map((option) => ({
                  optionId: option.optionId,
                  text: option.text,
                  votesCount: option.voters.length,
                })),
                totalVotesCount: tweet.retweetTo.poll.totalVoters,
                votedOptionId: tweet.retweetTo.poll.getVotedOptionBy(userId),
              }
            : undefined,
          mentions: tweet.retweetTo.mentions
            ? tweet.retweetTo.mentions.map(
                (mention) => mention.userMentioned.username
              )
            : undefined,
          reactCount: tweet.retweetTo.reactCount,
          reTweetCount: tweet.retweetTo.reTweetCount,
          repliesCount: tweet.retweetTo.repliesCount,
          isBookmarked: tweet.retweetTo.isBookmarkedBy(userId),
          isReacted: tweet.retweetTo.isReactedBy(userId),
          isRetweeted: tweet.retweetTo.isRetweetedBy(userId),
        }
      : undefined,
  };
};
