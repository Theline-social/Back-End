import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Conversation } from './Conversation';
import { User } from './User';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number;

  @Column({ type: 'int', nullable: true })
  conversationId: number;

  @Column({ type: 'int', nullable: true })
  senderId: number;

  @Column({ type: 'int', nullable: true })
  receiverId: number;

  @Column({ type: 'timestamptz' })
  time: Date;

  @Column({ type: 'varchar' })
  text: string;

  @Column({ type: 'boolean' })
  isSeen: boolean;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'SET NULL',
  })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  receiver: User;
}
