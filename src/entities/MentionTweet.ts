import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Tweet } from './Tweet';

@Entity()
export class MentionTweet {
  @PrimaryGeneratedColumn({ type: 'int' })
  mentionId: number;

  @ManyToOne(() => User, (user) => user.mentionsMadeInTeet)
  userMakingMention: User;

  @ManyToOne(() => User, (user) => user.mentionsReceivedFromTeet)
  userMentioned: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.mentions, { nullable: true })
  tweet: Tweet;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  mentionedAt: Date;
}
