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
import { TweetMedia } from './Media';
import { Tag } from './Tag';

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

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ type: 'enum', enum: TweetType, default: TweetType.Tweet })
  type: TweetType;

  @OneToMany(() => TweetMedia, (media) => media.tweet, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  media: TweetMedia[];

  @ManyToOne(() => User, (user) => user.tweets, { onDelete: 'CASCADE' })
  tweeter: User;

  @OneToMany(() => Tweet, (tweet) => tweet.retweetTo, { onDelete: 'CASCADE' })
  retweets: Tweet[];

  @ManyToOne(() => Tweet, (tweet) => tweet.retweets, { onDelete: 'CASCADE' })
  retweetTo: Tweet;

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
  bookmarkedBy: User[];

  @OneToOne(() => Poll, (poll) => poll.tweet, {
    onDelete: 'CASCADE',
    nullable: true,
    cascade: true,
  })
  poll: Poll;

  @ManyToMany(() => Tag, (trend) => trend.tweets, { onDelete: 'CASCADE' })
  tags: Tag[];

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

  isBookmarkedBy(userId: number): boolean {
    return this.bookmarkedBy.some((user) => user.userId === userId);
  }

  isRetweetedBy(userId: number): boolean {
    return this.retweets.some((retweet) => retweet.tweeter.userId === userId);
  }

  isReactedBy(userId: number): boolean {
    return this.reacts.some((user) => user.userId === userId);
  }
}
