import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { ReelReply } from './ReelReply';

@Entity()
export class ReelReplyMention {
  @PrimaryGeneratedColumn({ type: 'int' })
  mentionId: number;

  @ManyToOne(() => User, (user) => user.mentionsMadeInReelReply)
  userMakingMention: User;

  @ManyToOne(() => User, (user) => user.mentionsReceivedFromReelReply)
  userMentioned: User;

  @ManyToOne(() => ReelReply, (reply) => reply.mentions, { nullable: true })
  reply: ReelReply;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  mentionedAt: Date;
}
