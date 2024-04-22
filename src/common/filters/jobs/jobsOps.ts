import { userProfileRelations, userProfileSelectOptions } from '../users/userSelectOptions';

export const jobSelectOptions = {
  description: true,
  requiredApplicantsCount: true,
  media: true,
  applicants: { userId: true },
  jobId: true,
  userProfileSelectOptions,
};

export const jobRelations = {
  poster: userProfileRelations,
  relatedTopic: true,
  applicants: true,
};
