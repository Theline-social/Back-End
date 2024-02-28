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
import { TweetReply } from './TweetReply';
import { TweetMention } from './TweetMention';
import { Reel } from './Reel';
import { ReelReply } from './ReelReply';
import { ReelMention } from './ReelMention';
import { ReelReplyMention } from './ReelReplyMention';
import { TweetReplyMention } from './TweetReplyMention';
import { ReReel } from './ReReel';
import { PollOption } from './Poll';

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

  @Column({ type: 'varchar', nullable: true, default: `/users/default.jpeg` })
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

  @OneToMany(() => Tweet, (tweet) => tweet.tweeter, { onDelete: 'SET NULL' })
  tweets: Tweet[];

  @OneToMany(() => Reel, (reel) => reel.reeler)
  reels: Reel[];

  @OneToMany(() => Retweet, (retweet) => retweet.retweeter)
  retweets: Retweet[];

  @OneToMany(() => ReReel, (rereel) => rereel.user)
  rereels: ReReel[];

  @OneToMany(() => TweetReply, (reply) => reply.user)
  repliesTweets: TweetReply[];

  @OneToMany(() => ReelReply, (reply) => reply.user)
  repliesReels: ReelReply[];

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

  @ManyToMany(() => ReelReply, (replyReel) => replyReel.user)
  reactedReelReplies: ReelReply[];

  @ManyToMany(() => TweetReply, (replyTweet) => replyTweet.user)
  reactedTweetReplies: TweetReply[];

  @OneToMany(() => TweetMention, (mention) => mention.userMakingMention)
  mentionsMadeInTeet: TweetMention[];

  @OneToMany(() => ReelMention, (mention) => mention.userMakingMention)
  mentionsMadeInReel: ReelMention[];

  @OneToMany(() => TweetReplyMention, (mention) => mention.userMakingMention)
  mentionsMadeInTweetReply: TweetReplyMention[];

  @OneToMany(() => ReelReplyMention, (mention) => mention.userMakingMention)
  mentionsMadeInReelReply: ReelReplyMention[];

  @OneToMany(() => TweetMention, (mention) => mention.userMentioned)
  mentionsReceivedFromTeet: TweetMention[];

  @OneToMany(() => ReelMention, (mention) => mention.userMentioned)
  mentionsReceivedFromReel: ReelMention[];

  @OneToMany(() => TweetReplyMention, (mention) => mention.userMentioned)
  mentionsReceivedFromTweetReply: TweetReplyMention[];

  @OneToMany(() => ReelReplyMention, (mention) => mention.userMentioned)
  mentionsReceivedFromReelReply: ReelReplyMention[];

  @ManyToMany(() => Tweet, (tweet) => tweet.bookmarkedBy)
  @JoinTable()
  tweetBookmarks: Tweet[];

  @ManyToMany(() => Reel, (reel) => reel.bookmarkedBy)
  @JoinTable()
  reelBookmarks: Reel[];

  @ManyToMany(() => PollOption, (option) => option.voters)
  @JoinTable()
  votedOptions: PollOption[];
}
