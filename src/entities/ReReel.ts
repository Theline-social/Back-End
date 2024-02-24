import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Reel } from './Reel';

@Entity()
export class ReReel {
  @PrimaryGeneratedColumn({ type: 'int' })
  rereelId: number;

  @ManyToOne(() => User, (user) => user.rereels)
  user: User;

  @ManyToOne(() => Reel, (reel) => reel.rereels)
  reel: Reel;

  @Column({ type: 'varchar' })
  quote: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  rereeledAt: Date;
}
