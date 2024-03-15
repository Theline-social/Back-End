import { ILike } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { Tag } from '../entities';

export class TagsService {
  constructor() {}

  getTrendingTags = async (page: number, limit: number) => {
    const tagRepository = AppDataSource.getRepository(Tag);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3);

    let trendingTags = await tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.tweets', 'tweets')
      .leftJoinAndSelect('tag.reels', 'reels')
      .select([
        'tag.tag AS tag',
        'COUNT(DISTINCT tweets.tweetId) + COUNT(DISTINCT reels.reelId) AS totalSupport',
      ])
      .where(
        'tweets.createdAt >= :startDate OR reels.createdAt >= :startDate',
        { startDate }
      )
      .groupBy('tag.tag')
      .orderBy('totalSupport', 'DESC')
      .getRawMany();

    let filteredTrendingTags = trendingTags.filter(
      (trendingTag) => trendingTag.totalsupport > 0
    );

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTags = filteredTrendingTags.slice(startIndex, endIndex);

    return {
      tags: paginatedTags,
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
