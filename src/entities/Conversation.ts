import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity()
@Index(['user1Id', 'user2Id'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn()
  conversationId: number;

  @Column({ type: 'jsonb', default: {} })
  isUsersActive: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user2: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
