import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity()
@Index(['user1Id', 'user2Id'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn()
  conversationId: number;

  @Column({ type: 'int' })
  user1Id: number;

  @Column({ type: 'int' })
  user2Id: number;

  @Column({ type: 'jsonb', default: {} })
  isUsersActive: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user2: User;
}
