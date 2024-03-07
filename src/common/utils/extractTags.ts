import { In } from 'typeorm';
import { AppDataSource } from '../../dataSource';
import { Tag } from '../../entities';
import { hashtagRegex } from '../constants/regex';

export const extractTags = async (content: string) => {
  const tagRepository = AppDataSource.getRepository(Tag);

  const hashtags = content.match(hashtagRegex);

  if (!hashtags || hashtags.length === 0) {
    return { hashtags: undefined };
  }

  const formattedHashtags = hashtags.map((tag) =>
    tag.substring(1).toLowerCase()
  );

  const uniqueHashtags = Array.from(new Set(formattedHashtags));

  const existingTags = await tagRepository.find({
    where: {
      tag: In(uniqueHashtags),
    },
  });

  const newTags = uniqueHashtags.filter(
    (tag) => !existingTags.some((existingTag) => existingTag.tag === tag)
  );

  const hashtagEntities = newTags.map((tag) => {
    const hashtag = new Tag();
    hashtag.tag = tag;
    return hashtag;
  });

  const savedhashtages = await tagRepository.save(hashtagEntities);

  return { hashtags: existingTags.concat(savedhashtages) };
};
