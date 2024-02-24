import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Tweet } from './Tweet';
import { ReactReplyTweet } from './ReactReplyTweet';
import { MentionReplyTweet } from './MentionReplyTweet';

@Entity()
export class ReplyTweet {
  @PrimaryGeneratedColumn({ type: 'int' })
  replyId: number;

  @ManyToOne(() => User, (user) => user.repliesTweets)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.replies)
  tweet: Tweet;

  @ManyToOne(() => ReplyTweet, (parentReply) => parentReply.replies)
  parentReply: ReplyTweet;

  @OneToMany(() => ReplyTweet, (reply) => reply.parentReply)
  replies: ReplyTweet[];

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  repliedAt: Date;

  @OneToMany(() => ReactReplyTweet, (replyReact) => replyReact.reply)
  reacts: ReactReplyTweet[];

  @OneToMany(() => MentionReplyTweet, (mention) => mention.reply)
  mentions: MentionReplyTweet[];
}
