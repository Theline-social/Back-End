import { Employee } from '../../../entities/Employee';
import { EmpDto } from './empDto';

export const filterEmployee = (employee: Employee): EmpDto => {
  return {
    userId: employee.userId,
    name: employee.name,
    email: employee.email,
    phoneNumber: employee.phoneNumber,
    imageUrl: employee.imageUrl,
    createdAt: employee.createdAt,
    status: employee.status,
    type: employee.type,
    inActivatedAt: employee.inActivatedAt,
  };
};
