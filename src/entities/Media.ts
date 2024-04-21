import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tweet } from './Tweet';
import { Job } from './Job';

@Entity()
export class TweetMedia {
  @PrimaryGeneratedColumn()
  mediaId: number;

  @Column({ type: 'varchar', length: 200 })
  url: string;

  @ManyToOne(() => Tweet, (tweet) => tweet.media, { onDelete: 'CASCADE' })
  tweet: Tweet;
}

@Entity()
export class JobMedia {
  @PrimaryGeneratedColumn()
  mediaId: number;

  @Column({ type: 'varchar', length: 200 })
  url: string;

  @ManyToOne(() => Job, (job) => job.media, { onDelete: 'CASCADE' })
  job: Job;
}
