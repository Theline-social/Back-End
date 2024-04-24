import {
  userProfileRelations,
  userProfileSelectOptions,
} from '../users/userSelectOptions';

export const jobSelectOptions = {
  description: true,
  requiredApplicantsCount: true,
  jobDurationInDays: true,
  media: true,
  applicants: { userId: true },
  bookmarkedBy: { userId: true },
  jobId: true,
  poster: userProfileSelectOptions,
};

export const jobRelations = {
  relatedTopic: true,
  bookmarkedBy: true,
  applicants: true,
  poster: userProfileRelations,
};
