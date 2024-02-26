import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { TweetReply } from './TweetReply';

@Entity()
export class TweetReplyMention {
  @PrimaryGeneratedColumn({ type: 'int' })
  mentionId: number;

  @ManyToOne(() => User, (user) => user.mentionsMadeInTweetReply)
  userMakingMention: User;

  @ManyToOne(() => User, (user) => user.mentionsReceivedFromTweetReply)
  userMentioned: User;

  @ManyToOne(() => TweetReply, (reply) => reply.mentions, { nullable: true })
  reply: TweetReply;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  mentionedAt: Date;
}
