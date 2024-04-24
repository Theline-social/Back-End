import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tweet } from './Tweet';
import { TweetMention } from './TweetMention';
import { Reel } from './Reel';
import { ReelMention } from './ReelMention';
import { PollOption } from './Poll';
import { Subscription, SubscriptionType } from './Subscription';
import { Job } from './Job';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum AuthProvider {
  THELINE = 'THELINE',
  GOOGLE = 'GOOGLE',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 60,
    unique: true,
    nullable: false,
    default: `user${Date.now()}`,
  })
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'varchar', unique: true, length: 70 })
  email: string;

  @Column({ type: 'varchar', unique: true, length: 70 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 70, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true, default: `default.jpeg` })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true, default: 'banner_default2.jpeg' })
  bannerUrl: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 100, default: 'Engineer' })
  jobtitle: string;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.NONE,
  })
  subscriptionType: SubscriptionType;

  @Column({
    type: 'date',
    default: new Date(
      new Date().getFullYear() - 20,
      new Date().getMonth(),
      new Date().getDate()
    ),
  })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.MALE,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.THELINE,
  })
  authProvider: AuthProvider;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToMany(() => Tweet, (tweet) => tweet.tweeter, { onDelete: 'SET NULL' })
  tweets: Tweet[];

  @OneToMany(() => Reel, (reel) => reel.reeler)
  reels: Reel[];

  @OneToMany(() => Job, (job) => job.poster)
  postedJobs: Job[];

  @ManyToMany(() => User, (user) => user.following)
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable()
  following: User[];

  @ManyToMany(() => User, (user) => user.blocked)
  @JoinTable()
  blocking: User[];

  @ManyToMany(() => User, (user) => user.blocking)
  blocked: User[];

  @ManyToMany(() => User, (user) => user.muted)
  @JoinTable()
  muting: User[];

  @ManyToMany(() => User, (user) => user.muting)
  muted: User[];

  @ManyToMany(() => Tweet, (tweet) => tweet.reacts, { onDelete: 'CASCADE' })
  reactedTweets: Tweet[];

  @ManyToMany(() => Reel, (reel) => reel.reacts)
  reactedReels: Reel[];

  @OneToMany(() => TweetMention, (mention) => mention.userMakingMention)
  mentionsMadeInTeet: TweetMention[];

  @OneToMany(() => ReelMention, (mention) => mention.userMakingMention)
  mentionsMadeInReel: ReelMention[];

  @OneToMany(() => TweetMention, (mention) => mention.userMentioned)
  mentionsReceivedFromTeet: TweetMention[];

  @OneToMany(() => ReelMention, (mention) => mention.userMentioned)
  mentionsReceivedFromReel: ReelMention[];

  @ManyToMany(() => Tweet, (tweet) => tweet.bookmarkedBy)
  @JoinTable()
  tweetBookmarks: Tweet[];

  @ManyToMany(() => Reel, (reel) => reel.bookmarkedBy)
  @JoinTable()
  reelBookmarks: Reel[];

  @ManyToMany(() => Job, (job) => job.bookmarkedBy)
  @JoinTable()
  jobBookmarks: Job[];

  @ManyToMany(() => PollOption, (option) => option.voters)
  @JoinTable()
  votedOptions: PollOption[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @ManyToMany(() => Job, (job) => job.applicants)
  @JoinTable()
  jobsApplied: Job[];

  isMutedBy(userId: number): boolean {
    return this.muted.some((user) => user.userId === userId);
  }

  isBlockedBy(userId: number): boolean {
    return this.blocked.some((user) => user.userId === userId);
  }

  isBlocking(userId: number): boolean {
    return this.blocking.some((user) => user.userId === userId);
  }

  isFollowedBy(userId: number): boolean {
    return this.followers.some((user) => user.userId === userId);
  }

  get followersCount(): number {
    return this.followers ? this.followers.length : 0;
  }

  get followingsCount(): number {
    return this.following ? this.following.length : 0;
  }

  get postsCount(): number {
    return this.tweets.length + this.reels.length;
  }
}
