import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { User } from './User';
import { ReplyTweet } from './ReplyTweet';
  
  @Entity()
  export class MentionReplyTweet {
    @PrimaryGeneratedColumn({ type: 'int' })
    mentionId: number;
  
    @ManyToOne(() => User, (user) => user.mentionsMadeInReplyTweet)
    userMakingMention: User;
  
    @ManyToOne(() => User, (user) => user.mentionsReceivedFromReplyTweet)
    userMentioned: User;
  
    @ManyToOne(() => ReplyTweet, (reply) => reply.mentions, { nullable: true })
    reply: ReplyTweet;
  
    @CreateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP(6)',
    })
    mentionedAt: Date;
  }
  