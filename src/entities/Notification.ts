import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

export enum NotificationType {
  Follow = 'FOLLOW',
  Message = 'MESSAGE',

  Mention_Reel = 'MENTION_REEL',
  React_Reel = 'REACT_REEL',
  Reply_Reel = 'REPLY_REEL',
  Repost_Reel = 'REPOST_REEL',
  Quote_Reel = 'QUOTE_REEL',

  Mention_Tweet = 'MENTION_TWEET',
  React_Tweet = 'REACT_TWEET',
  Reply_Tweet = 'REPLY_TWEET',
  Repost_Tweet = 'REPOST_TWEET',
  Quote_Tweet = 'QUOTE_TWEET',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId: number;
  
  @Column({ type: 'boolean', default: false })
  isSeen: boolean;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  seenAt: Date;

  @Column({ type: 'json' })
  metadata: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  notificationTo: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  notificationFrom: User;
}
