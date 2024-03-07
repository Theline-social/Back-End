import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Tweet } from './Tweet';
import { Reel } from './Reel';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  trendId: number;

  @Column({ type: 'varchar', unique: true })
  tag: string;

  @ManyToMany(() => Tweet, (tweet) => tweet.tags)
  @JoinTable()
  tweets: Tweet[];

  @ManyToMany(() => Reel, (reel) => reel.tags)
  @JoinTable()
  reels: Reel[];
}
