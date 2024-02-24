import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Reel } from './Reel';
import { ReactType } from './ReactTweet';

@Entity()
export class ReactReel {
  @PrimaryGeneratedColumn({ type: 'int' })
  reactId: number;

  @ManyToOne(() => User, (user) => user.reactReels)
  user: User;

  @ManyToOne(() => Reel, (reel) => reel.reacts)
  reel: Reel;

  @Column({ type: 'enum', enum: ReactType, default: ReactType.LIKE })
  reactType: ReactType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  reactdAt: Date;
}
