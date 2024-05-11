import { In, Not } from 'typeorm';
import {
  AppError,
  addJobRequestBody,
  getPartialUserProfile,
  jobRelations,
  jobSelectOptions,
  userProfileRelations,
  userProfileSelectOptions,
} from '../common';
import { filterJob } from '../common/filters/jobs/filterJob';
import { AppDataSource } from '../dataSource';
import { JobMedia, Topic, User } from '../entities';
import { Job } from '../entities/Job';

export class JobService {
  constructor() {}

  addJob = async (
    userId: number,
    body: addJobRequestBody,
    lang: string = 'ar'
  ) => {
    const jobRepository = AppDataSource.getRepository(Job);
    const topicRepository = AppDataSource.getRepository(Topic);

    let media: JobMedia[] = [];
    if (body.imageUrls) {
      for (const img of body.imageUrls) {
        const newmedia = new JobMedia();
        newmedia.url = img;
        media.push(newmedia);
      }
    }

    const relatedTopic = await topicRepository.findOne({
      where: [
        {
          topic_ar: body.topic,
        },
        {
          topic_en: body.topic,
        },
      ],
    });

    if (!relatedTopic) throw new AppError('topic not supported', 400);

    const poster = new User();
    poster.userId = userId;

    const newJob = new Job();
    newJob.description = body.description;
    newJob.media = media;
    newJob.requiredApplicantsCount = body.requiredApplicantsCount;
    newJob.jobDurationInDays = body.jobDurationInDays;
    newJob.relatedTopic = relatedTopic;
    newJob.poster = poster;

    const savedJob = await jobRepository.save(newJob);

    return {
      job: {
        description: savedJob.description,
        topic:
          lang == 'ar'
            ? savedJob.relatedTopic.topic_ar
            : savedJob.relatedTopic.topic_en,
        media: savedJob.media,
        remainingApplications: savedJob.remainingApplications,
        remainingDays: savedJob.remainingDays,
      },
    };
  };

  applyForJob = async (userId: number, jobId: number) => {
    const jobRepository = AppDataSource.getRepository(Job);

    const newApplicant = new User();
    newApplicant.userId = userId;

    let job = await jobRepository.findOne({
      where: { jobId },
      relations: { applicants: true },
    });

    if (!job) throw new AppError(`Job ${jobId} not found`, 404);

    if (job.applicants) {
      job.applicants.push(newApplicant);
    } else {
      job.applicants = [newApplicant];
    }

    await jobRepository.save(job);
  };

  toggleBookmark = async (userId: number, jobId: number) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      relations: { jobBookmarks: true },
    });

    if (!user) throw new AppError('No user found', 404);

    const jobIndex = user.jobBookmarks.findIndex(
      (user) => user.jobId === jobId
    );

    if (jobIndex !== -1) {
      user.jobBookmarks.splice(jobIndex, 1);
    } else {
      const job = new Job();
      job.jobId = jobId;
      user.jobBookmarks.push(job);
    }

    await userRepository.save(user);
  };

  getJobApplicants = async (
    userId: number,
    jobId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const jobRepository = AppDataSource.getRepository(Job);

    const job = await jobRepository.findOne({
      where: { jobId },
      select: {
         poster: {userId: true},
        applicants: userProfileSelectOptions,
      },
      relations: {
        poster: true,
        applicants: userProfileRelations,
      },
    });

    if (!job) throw new AppError('Job not found', 404);
    if (job.poster.userId != userId) throw new AppError('Only job poster can see the applicants', 400);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedApplicants = job.applicants
      .slice(startIndex, endIndex)
      .map((applicant) => getPartialUserProfile(applicant, userId));

    return {
      applicants: paginatedApplicants,
      currentPage: page,
      totalPages: Math.ceil(job.applicants.length / limit),
    };
  };

  getTimelineJobs = async (
    userId: number,
    page: number = 1,
    limit: number = 30,
    lang: string = 'ar'
  ) => {
    const jobRepository = AppDataSource.getRepository(Job);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { userId },
      select: { following: { userId: true }, blocking: { userId: true } },
      relations: { following: true, blocking: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const followingsIds = user.following.map((following) => following.userId);
    const blockingsIds = user.blocking.map((blocking) => blocking.userId);

    const jobsOfFollowings = await jobRepository.find({
      where: {
        poster: {
          userId: In([...followingsIds]),
          ...(blockingsIds.length > 0 && {
            userId: Not(In([...blockingsIds])),
          }),
        },
      },
      select: jobSelectOptions,
      relations: jobRelations,
      order: { createdAt: 'DESC' },
    });

    let randomJobs: Job[] = [];
    if (jobsOfFollowings.length < limit) {
      randomJobs = await jobRepository.find({
        where: {
          poster: {
            userId: Not(In([...followingsIds])),
            ...(blockingsIds.length > 0 && {
              userId: Not(In([...blockingsIds])),
            }),
          },
        },
        select: jobSelectOptions,
        relations: jobRelations,
        order: { createdAt: 'DESC' },
      });
    }

    const mergedJobs = [...jobsOfFollowings, ...randomJobs];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = mergedJobs.slice(startIndex, endIndex);

    const timelineJobs = paginatedJobs.map((job) =>
      filterJob(job, userId, lang)
    );

    return { timelineJobs };
  };

  exists = async (id: number) => {
    const jobsRepository = AppDataSource.getRepository(Job);

    return await jobsRepository.exists({ where: { jobId: id } });
  };
}
