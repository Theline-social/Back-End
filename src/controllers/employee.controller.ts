import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../common';
import { EmployeeService } from '../services/employee.service';

const employeeService = new EmployeeService();

export const addEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const imageUrl = req.body.imageUrl;
    const { employee } = await employeeService.addEmployee(imageUrl, req.body);

    res.status(201).json({
      status: true,
      message: 'Employee created successfully',
      data: { employee },
    });
  }
);

export const getEmployees = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;

    const { employees } = await employeeService.getEmployees(
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { employees },
    });
  }
);

export const searchEmployees = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { page, limit, nameoremail } = req.query;

    const { employees } = await employeeService.search(
      nameoremail as string,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(200).json({
      status: true,
      data: { employees },
    });
  }
);

export const toggleActivateEmp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await employeeService.toggleActivateEmp(+req.params.employeeId);

    res.status(200).json({
      status: true,
      message: 'Acctivation toggled successfully',
    });
  }
);
