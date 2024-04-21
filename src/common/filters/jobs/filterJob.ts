import { Job } from '../../../entities';
import { JobDto } from './JobDto';

export const filterJob = (job: Job, lang: string, userId: number): JobDto => {
  return {
    description: job.description,
    topic: lang == 'ar' ? job.relatedTopic.topic_ar : job.relatedTopic.topic_en,
    media: job.media,
    applicantsCount: job.applicantsCount,
    bookmarksCount: job.bookmarksCount,
    remainingApplications: job.remainingApplications,
    remainingDays: job.remainingDays,
    isBookmarked: job.isBookmarkedBy(userId),
  };
};
