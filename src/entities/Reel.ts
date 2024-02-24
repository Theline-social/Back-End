import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User';
import { ReplyReel } from './ReplyReel';
import { ReactReel } from './ReactReel';
import { MentionReel } from './MentionReel';
import { ReReel } from './ReReel';
import { Topic } from './Topic';

@Entity()
export class Reel {
  @PrimaryGeneratedColumn()
  reelId: number;

  @Column({ type: 'varchar', length: 200 })
  content: string;

  @Column({ type: 'varchar' })
  reelUrl: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reels, { onDelete: 'CASCADE' })
  reeler: User;

  @OneToMany(() => ReplyReel, (reply) => reply.reel)
  replies: ReplyReel[];

  @OneToMany(() => ReactReel, (reactReel) => reactReel.reel)
  reacts: ReactReel[];

  @OneToMany(() => MentionReel, (mention) => mention.reel)
  mentions: MentionReel[];

  @OneToMany(() => ReReel, (rereel) => rereel.reel)
  rereels: ReReel[];

  @ManyToMany(() => Topic, (topic) => topic.supportingReels)
  supportedTopics: Topic[];
}
