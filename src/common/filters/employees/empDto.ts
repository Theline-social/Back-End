import { EmployeeStatus, EmployeeType } from '../../../entities';

export interface EmpDto {
  userId: number;
  imageUrl: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: EmployeeStatus;
  type: EmployeeType;
  createdAt: Date;
  inActivatedAt: Date | null;
}
