import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tweet } from './Tweet';

@Entity()
export class TweetMedia {
  @PrimaryGeneratedColumn()
  mediaId: number;

  @Column({ type: 'varchar', length: 200 })
  url: string;

  @ManyToOne(() => Tweet, (tweet) => tweet.media, { onDelete: 'CASCADE' })
  tweet: Tweet;
}
