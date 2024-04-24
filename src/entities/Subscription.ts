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
  DEACTIVATEd = 'DEACTIVATED',
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
    default: SubscriptionStatus.DEACTIVATEd,
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

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
