import { Reel } from '../../../entities';
import { FilteredReelDto } from './reelSchemaDto';

export const filterReel = (
  reel: Reel,
  userId: number,
  lang: string
): FilteredReelDto => {
  return {
    reelId: reel.reelId,
    reelUrl: reel.reelUrl,
    content: reel.content,
    createdAt: reel.createdAt,
    type: reel.type,
    topics: reel.supportedTopics.map((topic: any) => ({
      topic: lang === 'ar' ? topic.topic_ar : topic.topic_en,
      description: lang === 'ar' ? topic.description_ar : topic.description_en,
    })),
    mentions: reel.mentions
      ? reel.mentions.map((mention: any) => mention.userMentioned.username)
      : undefined,
    reactCount: reel.reactCount,
    reReelCount: reel.reReelCount,
    repliesCount: reel.repliesCount,
    isBookmarked: reel.isBookmarkedBy(userId),
    isReacted: reel.isReactedBy(userId),
    isRereeled: reel.isRereeledBy(userId),
    reeler: {
      userId: reel.reeler.userId,
      imageUrl: reel.reeler.imageUrl,
      username: reel.reeler.username,
      jobtitle: reel.reeler.jobtitle,
      name: reel.reeler.name,
      bio: reel.reeler.bio,
      followersCount: reel.reeler.followersCount,
      followingsCount: reel.reeler.followingsCount,
      isMuted: reel.reeler.isMutedBy(userId),
      isBlocked: reel.reeler.isBlockedBy(userId),
      isFollowed: reel.reeler.isFollowedBy(userId),
    },
    originalReeler: reel.rereelTo
      ? {
          userId: reel.rereelTo.reeler.userId,
          imageUrl: reel.rereelTo.reeler.imageUrl,
          username: reel.rereelTo.reeler.username,
          jobtitle: reel.rereelTo.reeler.jobtitle,
          name: reel.rereelTo.reeler.name,
          bio: reel.rereelTo.reeler.bio,
          followersCount: reel.rereelTo.reeler.followersCount,
          followingsCount: reel.rereelTo.reeler.followingsCount,
          isMuted: reel.rereelTo.reeler.isMutedBy(userId),
          isBlocked: reel.rereelTo.reeler.isBlockedBy(userId),
          isFollowed: reel.rereelTo.reeler.isFollowedBy(userId),
        }
      : undefined,
    originalReel: reel.rereelTo
      ? {
          reelId: reel.rereelTo.reelId,
          reelUrl: reel.rereelTo.reelUrl,
          content: reel.rereelTo.content,
          createdAt: reel.rereelTo.createdAt,
          type: reel.rereelTo.type,
          topics: reel.rereelTo.supportedTopics.map((topic: any) => ({
            topic: lang === 'ar' ? topic.topic_ar : topic.topic_en,
            description:
              lang === 'ar' ? topic.description_ar : topic.description_en,
          })),
          mentions: reel.rereelTo.mentions
            ? reel.rereelTo.mentions.map(
                (mention: any) => mention.userMentioned.username
              )
            : undefined,
          reactCount: reel.rereelTo.reactCount,
          reReelCount: reel.rereelTo.reReelCount,
          repliesCount: reel.rereelTo.repliesCount,
          isBookmarked: reel.rereelTo.isBookmarkedBy(userId),
          isReacted: reel.rereelTo.isReactedBy(userId),
          isRereeled: reel.rereelTo.isRereeledBy(userId),
        }
      : undefined,
  };
};
