import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EmployeeType {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'employees' })
export class Employee {
  @PrimaryGeneratedColumn({ type: 'int' })
  employeeId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'varchar', unique: true, length: 70 })
  email: string;

  @Column({ type: 'varchar', unique: true, length: 70 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true, default: `default.jpeg` })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: EmployeeType,
    default: EmployeeType.EMPLOYEE,
  })
  type: EmployeeType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  inActivatedAt: Date;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.INACTIVE,
  })
  status: EmployeeStatus;
}
