import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Reel } from './Reel';

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
}
