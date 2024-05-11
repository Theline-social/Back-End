import { Job } from '../../../entities';
import { JobDto } from './JobDto';

export const filterJob = (job: Job, userId: number, lang: string): JobDto => {
  return {
    jobId: job.jobId,
    description: job.description,
    topic: lang == 'ar' ? job.relatedTopic.topic_ar : job.relatedTopic.topic_en,
    media: job.media,
    createdAt: job.createdAt,
    applicantsCount: job.applicantsCount,
    bookmarksCount: job.bookmarksCount,
    remainingApplications: job.remainingApplications,
    remainingDays: job.remainingDays,
    isBookmarked: job.isBookmarkedBy(userId),
    poster: {
      userId: job.poster.userId,
      imageUrl: job.poster.imageUrl,
      username: job.poster.username,
      jobtitle: job.poster.jobtitle,
      name: job.poster.name,
      bio: job.poster.bio,
      followersCount: job.poster.followersCount,
      followingsCount: job.poster.followingsCount,
      subscriptionType: job.poster.subscriptionType,
      isMuted: job.poster.isMutedBy(userId),
      isBlocked: job.poster.isBlockedBy(userId),
      isFollowed: job.poster.isFollowedBy(userId),
    },
  };
};
