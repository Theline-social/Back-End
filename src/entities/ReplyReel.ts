import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Reel } from './Reel';
import { ReactReplyReel } from './ReactReplyReel';
import { MentionReplyReel } from './MentionReplyReel';

@Entity()
export class ReplyReel {
  @PrimaryGeneratedColumn({ type: 'int' })
  replyId: number;

  @ManyToOne(() => User, (user) => user.repliesReels)
  user: User;

  @ManyToOne(() => Reel, (reel) => reel.replies)
  reel: Reel;

  @ManyToOne(() => ReplyReel, (parentReply) => parentReply.replies)
  parentReply: ReplyReel;

  @OneToMany(() => ReplyReel, (reply) => reply.parentReply)
  replies: ReplyReel[];

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  repliedAt: Date;

  @OneToMany(() => ReactReplyReel, (replyReact) => replyReact.reply)
  reacts: ReactReplyReel[];

  
  @OneToMany(() => MentionReplyReel, (mention) => mention.reply)
  mentions: MentionReplyReel[];
}
