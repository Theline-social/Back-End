import { DataSource } from 'typeorm';
import {
  OtpCodes,
  Message,
  Conversation,
  Tweet,
  Notification,
  User,
  Retweet,
  ReplyReel,
  ReplyTweet,
  MentionTweet,
  MentionReplyTweet,
  MentionReplyReel,
  MentionReel,
  ReReel,
  ReactReplyReel,
  ReactReel,
  ReactReplyTweet,
  ReactTweet,
  ReactType,
  Topic,
  Reel,
} from './entities';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST as string,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME as string,
  password: process.env.DATABASE_PASSWORD as string,
  database:
    process.env.NODE_ENV === 'testing'
      ? process.env.DATABASE_TEST_NAME
      : process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  ssl: process.env.SSL === 'TRUE',
  extra: {
    ssl: process.env.SSL === 'TRUE' ? { rejectUnauthorized: false } : false,
  },
  entities: [
    User,
    Message,
    Notification,
    Conversation,
    Tweet,
    OtpCodes,
    Retweet,
    ReReel,
    ReplyReel,
    ReplyTweet,
    ReactReplyReel,
    ReactReel,
    ReactReplyTweet,
    ReactTweet,
    MentionTweet,
    MentionReplyTweet,
    MentionReplyReel,
    MentionReel,
    Topic,
    Reel,
  ],
  subscribers: [],
  migrations: [],
});

export { AppDataSource };
