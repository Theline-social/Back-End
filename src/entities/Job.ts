import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Topic } from './Topic';
import { JobMedia } from './Media';
import { User } from './User';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  jobId: number;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User, (user) => user.postedJobs, { onDelete: 'CASCADE' })
  poster: User;

  @Column({ type: 'integer', default: 0 })
  requiredApplicantsCount: number;

  @Column({ type: 'integer', default: 0 })
  jobDurationInDays: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @OneToMany(() => JobMedia, (media) => media.job, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  media: JobMedia[];

  @ManyToOne(() => Topic, { onDelete: 'CASCADE' })
  @JoinColumn()
  relatedTopic: Topic;

  @ManyToMany(() => User, (user) => user.jobBookmarks, {
    onDelete: 'CASCADE',
  })
  bookmarkedBy: User[];

  @ManyToMany(() => User, (user) => user.jobsApplied)
  applicants: User[];

  get bookmarksCount(): number {
    return this.bookmarkedBy ? this.bookmarkedBy.length : 0;
  }

  get applicantsCount(): number {
    return this.applicants ? this.applicants.length : 0;
  }

  get remainingDays(): number {
    const currentDate: Date = new Date();
    const endDate: Date = new Date(
      currentDate.getTime() + this.jobDurationInDays * 24 * 60 * 60 * 1000
    );
    const remainingMilliseconds: number =
      endDate.getTime() - currentDate.getTime();
    const remainingDays: number = Math.ceil(
      remainingMilliseconds / (1000 * 60 * 60 * 24)
    );
    return remainingDays;
  }

  get remainingApplications(): number {
    return this.applicants
      ? this.requiredApplicantsCount - this.applicants.length
      : 0;
  }

  isBookmarkedBy(userId: number): boolean {
    return this.bookmarkedBy.some((user) => user.userId === userId);
  }
}
