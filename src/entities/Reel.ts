import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User';
import { ReelMention } from './ReelMention';
import { Topic } from './Topic';
import { Tag } from './Tag';

export enum ReelType {
  Reel = 'Reel',
  Reply = 'Reply',
  Repost = 'Repost',
  Quote = 'Quote',
}

@Entity()
export class Reel {
  @PrimaryGeneratedColumn()
  reelId: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  reelUrl: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ type: 'enum', enum: ReelType, default: ReelType.Reel })
  type: ReelType;

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

  @OneToMany(() => Reel, (reel) => reel.rereelTo, { onDelete: 'CASCADE' })
  rereels: Reel[];

  @ManyToOne(() => Reel, (reel) => reel.rereels, { onDelete: 'CASCADE' })
  rereelTo: Reel;

  @ManyToOne(() => Reel, (reel) => reel.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  replyTo: Reel;

  @OneToMany(() => Reel, (reel) => reel.replyTo, { onDelete: 'CASCADE' })
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

  @ManyToMany(() => Tag, (trend) => trend.reels, { onDelete: 'NO ACTION' })
  tags: Tag[];

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

  isBookmarkedBy(userId: number): boolean {
    return this.bookmarkedBy.some((user) => user.userId === userId);
  }

  isRereeledBy(userId: number): boolean {
    return this.rereels.some((retweet) => retweet.reeler.userId === userId);
  }

  isReactedBy(userId: number): boolean {
    return this.reacts.some((user) => user.userId === userId);
  }
}
