import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { TweetMention } from './TweetMention';
import { Poll } from './Poll';

export enum TweetType {
  Tweet = 'Tweet',
  Reply = 'Reply',
  Repost = 'Repost',
  Quote = 'Quote',
}

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  tweetId: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  content: string;

  @Column({ type: 'varchar', array: true, length: 200, nullable: true })
  imageUrls: string[];

  @Column({ type: 'varchar', length: 200, nullable: true })
  gifUrl: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ type: 'enum', enum: TweetType, default: TweetType.Tweet })
  type: TweetType;

  @ManyToOne(() => User, (user) => user.tweets, { onDelete: 'CASCADE' })
  tweeter: User;

  @OneToMany(() => Tweet, (tweet) => tweet.retweetTo, { onDelete: 'CASCADE' })
  retweets: Tweet[];

  @ManyToOne(() => Tweet, (tweet) => tweet.retweets, { onDelete: 'CASCADE' })
  retweetTo: Tweet;

  @ManyToMany(() => User, (user) => user.retweetedTweets, {
    onDelete: 'CASCADE',
  })
  retweetedBy: User[];

  @ManyToOne(() => Tweet, (tweet) => tweet.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  replyTo: Tweet;

  @OneToMany(() => Tweet, (tweet) => tweet.replyTo, { onDelete: 'CASCADE' })
  replies: Tweet[];

  @ManyToMany(() => User, (user) => user.reactedTweets, { onDelete: 'CASCADE' })
  @JoinTable()
  reacts: User[];

  @OneToMany(() => TweetMention, (mention) => mention.tweet, {
    onDelete: 'CASCADE',
  })
  mentions: TweetMention[];

  @ManyToMany(() => User, (user) => user.tweetBookmarks, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  bookmarkedBy: User[];

  @OneToOne(() => Poll, (poll) => poll.tweet, {
    onDelete: 'CASCADE',
    nullable: true,
    cascade: true,
  })
  poll: Poll;

  get reactCount(): number {
    return this.reacts ? this.reacts.length : 0;
  }
  get repliesCount(): number {
    return this.replies ? this.replies.length : 0;
  }
  get bookmarksCount(): number {
    return this.bookmarkedBy ? this.bookmarkedBy.length : 0;
  }
  get reTweetCount(): number {
    return this.retweets ? this.retweets.length : 0;
  }
}
