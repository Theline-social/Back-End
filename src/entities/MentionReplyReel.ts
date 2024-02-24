import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { ReplyReel } from './ReplyReel';

@Entity()
export class MentionReplyReel {
  @PrimaryGeneratedColumn({ type: 'int' })
  mentionId: number;

  @ManyToOne(() => User, (user) => user.mentionsMadeInReplyReel)
  userMakingMention: User;

  @ManyToOne(() => User, (user) => user.mentionsReceivedFromReplyReel)
  userMentioned: User;

  @ManyToOne(() => ReplyReel, (reply) => reply.mentions, { nullable: true })
  reply: ReplyReel;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  mentionedAt: Date;
}
