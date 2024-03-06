import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

export enum NotificationType {
  Mention = 'MENTION',
  Follow = 'FOLLOW',
  Message = 'MESSAGE',
  React = 'REACT',
  Reply = 'REPLY',
  Repost = 'REPOST',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isSeen: boolean;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ type: 'json' })
  metadata: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  notificationTo: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  notificationFrom: User;
}
