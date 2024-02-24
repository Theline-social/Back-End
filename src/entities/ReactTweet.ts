import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Tweet } from './Tweet';

export enum ReactType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  SUPPORT = 'SUPPORT',
}

@Entity()
export class ReactTweet {
  @PrimaryGeneratedColumn({ type: 'int' })
  reactId: number;

  @ManyToOne(() => User, (user) => user.reactTweets)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.reacts)
  tweet: Tweet;

  @Column({ type: 'enum', enum: ReactType, default: ReactType.LIKE })
  reactType: ReactType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  reactdAt: Date;
}
