import { ILike, Like } from 'typeorm';
import {
    Password,
  addEmplyeeRequestBody,
  emailRegex,
  filterEmployee,
  isPhoneValid,
} from '../common';
import { AppDataSource } from '../dataSource';
import { Employee } from '../entities/Employee';

export class EmployeeService {
  constructor() {}

  addEmployee = async (imageUrl: string, body: addEmplyeeRequestBody) => {
    const employeeRepository = AppDataSource.getRepository(Employee);

    const employee = new Employee();
    employee.email = body.email;
    employee.name = body.name;
    employee.password = await Password.hashPassword(body.password);
    employee.phoneNumber = body.phoneNumber;
    employee.imageUrl = imageUrl;
    employee.status = body.status;
    employee.type = body.type;

    const savedEmployee = await employeeRepository.save(employee);

    return {
      employee: filterEmployee(savedEmployee),
    };
  };

  getEmployees = async (page: number = 1, limit: number = 30) => {
    const employeeRepository = AppDataSource.getRepository(Employee);

    const employees = await employeeRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      employees: employees.map((employee) => filterEmployee(employee)),
    };
  };

  search = async (
    nameoremailtosearch: string,
    page: number = 1,
    limit: number = 30
  ) => {
    const employeeRepository = AppDataSource.getRepository(Employee);

    const employees = await employeeRepository.find({
      where: [
        { name: ILike(`%${nameoremailtosearch.toLowerCase()}%`) },
        { name: Like(`${nameoremailtosearch.toLowerCase()}%`) },
        { email: ILike(`%${nameoremailtosearch.toLowerCase()}%`) },
        { email: Like(`${nameoremailtosearch.toLowerCase()}%`) },
      ],
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      employees: employees.map((employee) => filterEmployee(employee)),
    };
  };

  isEmployeeFound = async (body: { input: string }) => {
    const { input } = body;
    let employee: Employee | null = null;
    const employeeRepository = AppDataSource.getRepository(Employee);

    if (input.match(emailRegex)) {
      employee = await employeeRepository.findOne({
        where: { email: input.toLowerCase() },
        select: { email: true, phoneNumber: true, name: true },
      });
    } else if (isPhoneValid(input)) {
      employee = await employeeRepository.findOne({
        where: { phoneNumber: input },
        select: { email: true, phoneNumber: true, name: true },
      });
    }

    return {
      isFound: employee !== null,
      data: {
        email: employee?.email,
        phoneNumber: employee?.phoneNumber,
        name: employee?.name,
      },
    };
  };
}
