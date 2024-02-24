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
} from 'typeorm';
import { User } from './User';
import { Retweet } from './ReTweet';
import { ReplyTweet } from './ReplyTweet';
import { ReactTweet } from './ReactTweet';
import { MentionTweet } from './MentionTweet';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  tweetId: number;

  @Column({ type: 'varchar', length: 200 })
  content: string;

  @Column({ type: 'varchar', array: true, length: 200, nullable: true })
  imageUrls: string[];

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

  @OneToMany(() => Retweet, (retweet) => retweet.tweet)
  retweets: Retweet[];

  @OneToMany(() => ReplyTweet, (reply) => reply.tweet)
  replies: ReplyTweet[];

  @OneToMany(() => ReactTweet, (reactTweet) => reactTweet.tweet)
  reacts: ReactTweet[];

  @OneToMany(() => MentionTweet, (mention) => mention.tweet)
  mentions: MentionTweet[];
}
