import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OtpProvider {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

@Entity()
@Index(['provider', 'input'], { unique: true })
export class OtpCodes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  hashedCode: string;

  @Column({
    type: 'enum',
    enum: OtpProvider,
  })
  provider: OtpProvider;

  @Column({ nullable: true })
  input: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isVerified: boolean;

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
}
