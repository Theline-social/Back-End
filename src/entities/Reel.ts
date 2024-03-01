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
import { ReelMention } from './ReelMention';
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

  @ManyToMany(() => User, (user) => user.reactedReels, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  reacts: User[];

  @OneToMany(() => ReelMention, (mention) => mention.reel, {
    onDelete: 'CASCADE',
  })
  mentions: ReelMention[];

  @OneToMany(() => ReReel, (rereel) => rereel.reel, {
    onDelete: 'CASCADE',
  })
  rereels: ReReel[];

  @ManyToOne(() => Reel, (reel) => reel.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  replyTo: Reel;

  @OneToMany(() => Reel, (reel) => reel.replyTo)
  replies: Reel[];

  @ManyToMany(() => Topic, (topic) => topic.supportingReels, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  supportedTopics: Topic[];

  @ManyToMany(() => User, (user) => user.reelBookmarks, {
    onDelete: 'CASCADE',
  })
  bookmarkedBy: User[];

  get reactCount(): number {
    return this.reacts ? this.reacts.length : 0;
  }
  get repliesCount(): number {
    return this.replies ? this.replies.length : 0;
  }
  get bookmarksCount(): number {
    return this.bookmarkedBy ? this.bookmarkedBy.length : 0;
  }
  get reReelCount(): number {
    return this.rereels ? this.rereels.length : 0;
  }
}
