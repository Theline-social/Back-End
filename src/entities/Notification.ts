import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  senderId: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isSeen: boolean;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'enum', enum: ['CHAT', 'MENTION', 'FOLLOW', 'UNFOLLOW'] })
  type: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;
}
