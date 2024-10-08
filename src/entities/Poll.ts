import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Tweet } from './Tweet';
import { User } from './User';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn()
  pollId: number;

  @Column({ type: 'varchar' })
  question: string;

  @OneToMany(() => PollOption, (option) => option.poll, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  options: PollOption[];

  @Column({ type: 'timestamptz' })
  length: Date;

  @OneToOne(() => Tweet, (tweet) => tweet.poll, { onDelete: 'CASCADE' })
  @JoinColumn()
  tweet: Tweet;

  get totalVoters(): number {
    return this.options.reduce(
      (total, option) => total + option.voters.length,
      0
    );
  }

  getVotedOptionBy(userId: number) {
    for (const option of this.options)
      if (option.voters.some((user) => user.userId === userId))
        return option.optionId;

    return undefined;
  }
}

@Entity()
export class PollOption {
  @PrimaryGeneratedColumn()
  optionId: number;

  @Column({ type: 'varchar', length: 200 })
  text: string;

  @ManyToMany(() => User, (user) => user.votedOptions, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  voters: User[];

  @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: 'CASCADE' })
  poll: Poll;
}
