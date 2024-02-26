import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { User } from './User';
import { Tweet } from './Tweet';
import { TweetReplyMention } from './TweetReplyMention';

@Entity()
export class TweetReply {
  @PrimaryGeneratedColumn({ type: 'int' })
  replyId: number;

  @ManyToOne(() => User, (user) => user.repliesTweets)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.replies)
  tweet: Tweet;

  @ManyToOne(() => TweetReply, (parentReply) => parentReply.replies)
  parentReply: TweetReply;

  @OneToMany(() => TweetReply, (reply) => reply.parentReply)
  replies: TweetReply[];

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  repliedAt: Date;

  @ManyToMany(() => User, (user) => user.reactedTweetReplies)
  @JoinTable()
  reacts: User[];

  @OneToMany(() => TweetReplyMention, (mention) => mention.reply)
  mentions: TweetReplyMention[];

  get reactCount(): number {
    return this.reacts ? this.reacts.length : 0;
  }
}
