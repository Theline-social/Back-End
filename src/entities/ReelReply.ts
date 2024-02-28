import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User';
import { Reel } from './Reel';
import { ReelReplyMention } from './ReelReplyMention';

@Entity()
export class ReelReply {
  @PrimaryGeneratedColumn({ type: 'int' })
  replyId: number;

  @ManyToOne(() => User, (user) => user.repliesReels)
  user: User;

  @ManyToOne(() => Reel, (reel) => reel.replies)
  reel: Reel;

  @ManyToOne(() => ReelReply, (parentReply) => parentReply.replies)
  parentReply: ReelReply;

  @OneToMany(() => ReelReply, (reply) => reply.parentReply)
  replies: ReelReply[];

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  repliedAt: Date;

  @ManyToMany(() => User, (user) => user.reactedReelReplies)
  @JoinTable()
  reacts: User[];

  @OneToMany(() => ReelReplyMention, (mention) => mention.reply)
  mentions: ReelReplyMention[];
}
