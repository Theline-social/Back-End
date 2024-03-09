import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  OneToMany,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity()
@Unique(['user1', 'user2'])
export class Conversation {
  @PrimaryGeneratedColumn()
  conversationId: number;

  @Column({ type: 'jsonb', default: {} })
  isUsersActive: Record<string, any>;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user2: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
