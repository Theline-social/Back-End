import {
  AppError,
  addJobRequestBody,
  getPartialUserProfile,
  userProfileRelations,
  userProfileSelectOptions,
} from '../common';
import { filterJob } from '../common/filters/jobs/filterJob';
import { AppDataSource } from '../dataSource';
import { JobMedia, Topic, User } from '../entities';
import { Job } from '../entities/Job';

export class JobService {
  constructor() {}

  addJob = async (lang: string, userId: number, body: addJobRequestBody) => {
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

    const newJob = new Job();
    newJob.description = body.description;
    newJob.media = media;
    newJob.availableApplicantsCount = body.availableApplicantsCount;
    newJob.jobDurationInDays = body.jobDurationInDays;
    newJob.relatedTopic = relatedTopic;

    const savedJob = await jobRepository.save(newJob);

    return { job: filterJob(savedJob, lang, userId) };
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
    jobId: number,
    userId: number,
    page: number = 1,
    limit: number = 30
  ) => {
    const jobRepository = AppDataSource.getRepository(Job);

    const job = await jobRepository.findOne({
      where: { jobId },
      select: {
        applicants: userProfileSelectOptions,
      },
      relations: {
        applicants: userProfileRelations,
      },
    });

    if (!job) throw new AppError('Reel not found', 404);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedApplicants = job.applicants
      .slice(startIndex, endIndex)
      .map((applicant) => getPartialUserProfile(applicant, userId));

    return {
      reacters: paginatedApplicants,
      currentPage: page,
      totalPages: Math.ceil(job.applicants.length / limit),
    };
  };
}
