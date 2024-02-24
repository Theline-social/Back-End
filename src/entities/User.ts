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
import { Retweet } from './ReTweet';
import { ReplyTweet } from './ReplyTweet';
import { ReactTweet } from './ReactTweet';
import { ReactReplyReel } from './ReactReplyReel';
import { MentionTweet } from './MentionTweet';
import { ReactReel } from './ReactReel';
import { Reel } from './Reel';
import { ReplyReel } from './ReplyReel';
import { ReactReplyTweet } from './ReactReplyTweet';
import { MentionReel } from './MentionReel';
import { MentionReplyReel } from './MentionReplyReel';
import { MentionReplyTweet } from './MentionReplyTweet';
import { ReReel } from './ReReel';

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
    default: `@user-${Date.now()}`,
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

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  bannerUrl: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 100, default: 'Engineer' })
  jobtitle: string;

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

  @OneToMany(() => Tweet, (tweet) => tweet.tweeter)
  tweets: Tweet[];

  @OneToMany(() => Reel, (reel) => reel.reeler)
  reels: Reel[];

  @OneToMany(() => Retweet, (retweet) => retweet.user)
  retweets: Retweet[];

  @OneToMany(() => ReReel, (rereel) => rereel.user)
  rereels: ReReel[];

  @OneToMany(() => ReplyTweet, (reply) => reply.user)
  repliesTweets: ReplyTweet[];

  @OneToMany(() => ReplyReel, (reply) => reply.user)
  repliesReels: ReplyReel[];

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
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

  @OneToMany(() => ReactTweet, (reactTweet) => reactTweet.user)
  reactTweets: ReactTweet[];

  @OneToMany(() => ReactReel, (reactReel) => reactReel.user)
  reactReels: ReactReel[];

  @OneToMany(() => ReactReplyReel, (reactReply) => reactReply.user)
  reactReelReplies: ReactReplyReel[];

  @OneToMany(() => ReactReplyTweet, (reactReply) => reactReply.user)
  reactTweetReplies: ReactReplyTweet[];

  @OneToMany(() => MentionTweet, (mention) => mention.userMakingMention)
  mentionsMadeInTeet: MentionTweet[];

  @OneToMany(() => MentionReel, (mention) => mention.userMakingMention)
  mentionsMadeInReel: MentionReel[];

  @OneToMany(() => MentionReplyTweet, (mention) => mention.userMakingMention)
  mentionsMadeInReplyTweet: MentionReplyTweet[];

  @OneToMany(() => MentionReplyReel, (mention) => mention.userMakingMention)
  mentionsMadeInReplyReel: MentionReplyReel[];

  @OneToMany(() => MentionTweet, (mention) => mention.userMentioned)
  mentionsReceivedFromTeet: MentionTweet[];

  @OneToMany(() => MentionReel, (mention) => mention.userMentioned)
  mentionsReceivedFromReel: MentionReel[];

  @OneToMany(() => MentionReplyTweet, (mention) => mention.userMentioned)
  mentionsReceivedFromReplyTweet: MentionReplyTweet[];

  @OneToMany(() => MentionReplyReel, (mention) => mention.userMentioned)
  mentionsReceivedFromReplyReel: MentionReplyReel[];
}
