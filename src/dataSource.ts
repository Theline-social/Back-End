import { DataSource } from 'typeorm';
import {
  OtpCodes,
  Message,
  Conversation,
  Tweet,
  Notification,
  User,
  ReelMention,
  TweetMention,
  Topic,
  Reel,
  Poll,
  PollOption,
  TweetMedia,
  Tag,
  Subscription,
  Employee,
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
    TweetMedia,
    OtpCodes,
    TweetMention,
    ReelMention,
    Topic,
    Reel,
    Poll,
    PollOption,
    Tag,
    Subscription,
    Employee
  ],
  subscribers: [],
  migrations: [],
});

export { AppDataSource };
