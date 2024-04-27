import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum SubscriptionType {
  INTERESTED = 'INTERESTED',
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS',
  NONE = 'NONE',
}

export enum SubscriptionStatus {
  ACTIVATED = 'ACTIVATED',
  DEACTIVATED = 'DEACTIVATED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn({ type: 'int' })
  subscriptionId: number;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.INTERESTED,
  })
  type: SubscriptionType;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.DEACTIVATED,
  })
  status: SubscriptionStatus;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column()
  fullname: string;

  @Column()
  liveImage: string;

  @Column({ nullable: true })
  reviewerEmployeeName: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  endDate: Date;

  @Column({ type: 'varchar', default: 'FreeTrial' })
  myFatoorahPaymentId: string;

  @Column({ type: 'boolean', default: false })
  isFreeTrialUsed: boolean;
}
