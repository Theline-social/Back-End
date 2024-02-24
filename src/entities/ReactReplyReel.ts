import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { ReplyReel } from './ReplyReel';
import { ReactType } from './ReactTweet';

@Entity()
export class ReactReplyReel {
  @PrimaryGeneratedColumn({ type: 'int' })
  reactId: number;

  @ManyToOne(() => User, (user) => user.reactReelReplies)
  user: User;

  @ManyToOne(() => ReplyReel, (reply) => reply.reacts)
  reply: ReplyReel;

  @Column({ type: 'enum', enum: ReactType, default: ReactType.LIKE })
  reactType: ReactType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  reactdAt: Date;
}
