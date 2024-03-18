import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './Conversation';
import { User } from './User';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number;

  @Column({ type: 'int', nullable: true })
  senderId: number;

  @Column({ type: 'int', nullable: true })
  receiverId: number;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => `timezone('gmt'::text, now()) + interval '4 hours'`,
  })
  createdAt: Date;

  @Column({ type: 'varchar' })
  text: string;

  @Column({ type: 'boolean' })
  isSeen: boolean;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'SET NULL',
  })
  conversation: Conversation;
}
