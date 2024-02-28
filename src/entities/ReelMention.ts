import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { User } from './User';
import { Reel } from './Reel';
  
  @Entity()
  export class ReelMention {
    @PrimaryGeneratedColumn({ type: 'int' })
    mentionId: number;
  
    @ManyToOne(() => User, (user) => user.mentionsMadeInReel)
    userMakingMention: User;
  
    @ManyToOne(() => User, (user) => user.mentionsReceivedFromReel)
    userMentioned: User;
  
    @ManyToOne(() => Reel, (reel) => reel.mentions, { nullable: true })
    reel: Reel;
  
    @CreateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP(6)',
    })
    mentionedAt: Date;
  }
  