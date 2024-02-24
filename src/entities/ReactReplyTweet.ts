import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { ReplyTweet } from './ReplyTweet';
import { ReactType } from './ReactTweet';

@Entity()
export class ReactReplyTweet {
  @PrimaryGeneratedColumn({ type: 'int' })
  reactId: number;

  @ManyToOne(() => User, (user) => user.reactTweetReplies)
  user: User;

  @ManyToOne(() => ReplyTweet, (reply) => reply.reacts)
  reply: ReplyTweet;

  @Column({ type: 'enum', enum: ReactType, default: ReactType.LIKE })
  reactType: ReactType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  reactdAt: Date;
}
