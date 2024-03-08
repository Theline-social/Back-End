import { ILike } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { Tag } from '../entities';

export class TagsService {
  constructor() {}

  getTrendingTags = async (page: number, limit: number) => {
    const tagRepository = AppDataSource.getRepository(Tag);

    const trendingTags = await tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.tweets', 'tweets')
      .leftJoinAndSelect('tag.reels', 'reels')
      .select([
        'tag.tag AS tag',
        'COUNT(DISTINCT tweets.tweetId) + COUNT(DISTINCT reels.reelId) AS totalSupport',
      ])
      .groupBy('tag.tag')
      .orderBy('totalSupport', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    return {
      tags: trendingTags,
    };
  };

  search = async (tag: string, page: number = 1, limit: number = 30) => {
    const tagRepository = AppDataSource.getRepository(Tag);

    const tags = await tagRepository.find({
      where: { tag: ILike(`%${tag.toLowerCase()}%`) },

      order: { tag: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      tags,
    };
  };
}
