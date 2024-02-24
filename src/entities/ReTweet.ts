import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Tweet } from './Tweet';

@Entity()
export class Retweet {
  @PrimaryGeneratedColumn({ type: 'int' })
  retweetId: number;

  @ManyToOne(() => User, (user) => user.retweets)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.retweets)
  tweet: Tweet;

  @Column({ type: 'varchar' })
  quote: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  retweetedAt: Date;
}
