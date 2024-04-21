import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Reel } from './Reel';
import { Job } from './Job';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  topicId: number;

  @Column({ type: 'varchar', length: 100 })
  topic_en: string;

  @Column({ type: 'varchar', length: 100 })
  topic_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en: string;

  @Column({ type: 'text', nullable: true })
  description_ar: string;

  @ManyToMany(() => Reel, (reel) => reel.supportedTopics)
  supportingReels: Reel[];

  @OneToMany(() => Job, (job) => job.relatedTopic)
  jobs: Job[];
}
