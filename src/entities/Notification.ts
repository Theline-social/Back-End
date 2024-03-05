import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isSeen: boolean;

  @Column({ type: 'enum', enum: ['CHAT', 'MENTION', 'FOLLOW', 'UNFOLLOW'] })
  type: string;

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
