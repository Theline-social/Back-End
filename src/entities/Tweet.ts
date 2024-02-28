import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { Retweet } from './ReTweet';
import { TweetReply } from './TweetReply';
import { TweetMention } from './TweetMention';
import { Poll } from './Poll';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  tweetId: number;

  @Column({ type: 'varchar', length: 200 , nullable: true})
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

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tweets, { onDelete: 'CASCADE' })
  tweeter: User;

  @OneToMany(() => Retweet, (retweet) => retweet.tweet, { onDelete: 'CASCADE' })
  retweets: Retweet[];

  @OneToMany(() => TweetReply, (reply) => reply.tweet, { onDelete: 'CASCADE' })
  replies: TweetReply[];

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
    eager: true,
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
