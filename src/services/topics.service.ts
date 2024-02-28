import { AddTopicBody } from '../common';
import { AppDataSource } from '../dataSource';
import { Topic, User } from '../entities';

export class TopicsService {
  constructor() {}

  getTopics = async (lang: string) => {
    const topics = await AppDataSource.getRepository(Topic).find();

    return {
      topics: topics.map((topic) => {
        if (lang === 'ar') {
          return {
            topic: topic.topic_ar,
            description: topic.description_ar,
          };
        } else {
          return {
            topic: topic.topic_en,
            description: topic.description_en,
          };
        }
      }),
    };
  };

  addTopic = async (body: AddTopicBody) => {
    const topic = new Topic();
    topic.description_ar = body.description_ar;
    topic.description_en = body.description_en;
    topic.topic_ar = body.topic_ar;
    topic.topic_en = body.topic_en;

    await AppDataSource.getRepository(Topic).save(topic);
  };

  deleteTopic = async (topicId: number) => {
    await AppDataSource.getRepository(Topic).delete({ topicId });
  };

  existsbyId = async (topicId: number) => {
    return await AppDataSource.getRepository(Topic).existsBy({ topicId });
  };

  existsbyTopicName = async (topic: string) => {
    return await AppDataSource.getRepository(Topic).exists({
      where: [{ topic_ar: topic }, { topic_en: topic }],
    });
  };

  getTopicReels = async (userId: number, topicName: string) => {
    const topicRepository = AppDataSource.getRepository(Topic);

    const topic = await topicRepository.findOne({
      where: [{ topic_ar: topicName }, { topic_en: topicName }],
      select: {
        supportingReels: {
          reacts: {
            email: true,
            username: true,
            jobtitle: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      relations: {
        supportingReels: {
          bookmarkedBy: true,
          reacts: true,
          rereels: true,
          replies: true,
        },
      },
    });

    if (!topic) {
      return { supportingreels: [] };
    }

    const sortedReels = topic.supportingReels.sort((a, b) => {
      const reactCountA = a.reactCount;
      const reactCountB = b.reactCount;

      return reactCountB - reactCountA;
    });

    return {
      supportingreels: sortedReels.map((reel) => {
        const isBookmarked = reel.bookmarkedBy.some(
          (user: User) => user.userId === userId
        );

        const isReacted = reel.reacts.some(
          (user: User) => user.userId === userId
        );

        return {
          ...reel,
          reactCount: reel.reactCount,
          reReelCount: reel.reReelCount,
          bookmarksCount: reel.bookmarksCount,
          repliesCount: reel.repliesCount,
          isBookmarked,
          isReacted,
        };
      }),
    };
  };
}
