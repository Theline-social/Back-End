import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tweet } from './Tweet';
import { Reel } from './Reel';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  trendId: number;

  @Column({ type: 'varchar', unique: true })
  tag: string;

  @ManyToMany(() => Tweet, (tweet) => tweet.tags, { onDelete: 'CASCADE' })
  @JoinTable()
  tweets: Tweet[];

  @ManyToMany(() => Reel, (reel) => reel.tags, { onDelete: 'CASCADE' })
  @JoinTable()
  reels: Reel[];
}
