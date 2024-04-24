import express, { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import * as authController from '../controllers/auth.controller';
import * as usersController from '../controllers/user.controller';
import {
  addEmpValidationRules,
  employeeIdParamsValidation,
  validateRequest,
} from '../common';
import { EmployeeType } from '../entities';

const router: Router = express.Router();

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees
 *     description: Retrieve a list of all employees.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default 1)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Number of results per page (default 10)
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A list of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   inActivatedAt:
 *                     type: string
 *                   status:
 *                     type: string
 */
router
  .route('/')
  .get(
    authController.requireEmpAuth,
    authController.strictEmployeeTo(EmployeeType.ADMIN),
    employeeController.getEmployees
  );

/**
 * @swagger
 * /employees/add-employee:
 *   post:
 *     summary: Add a new employee
 *     description: Add a new employee to the system.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               image_profile:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Employee added successfully
 *       '400':
 *         description: Bad request, validation error
 */
router
  .route('/add-employee')
  .post(
    authController.requireEmpAuth,
    authController.strictEmployeeTo(EmployeeType.ADMIN),
    usersController.uploadProfileMedia,
    usersController.processProfileMedia,
    addEmpValidationRules,
    validateRequest,
    employeeController.addEmployee
  );

/**
 * @swagger
 * /employees/search:
 *   get:
 *     summary: Search employees
 *     description: Search for employees by name or other criteria.
 *     tags:
 *       - search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nameoremail
 *         description: Name or username to search for (partial match)
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default 1)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Number of results per page (default 10)
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A list of employees matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   inActivatedAt:
 *                     type: string
 *                   status:
 *                     type: string
 */

router
  .route('/search')
  .get(
    authController.requireEmpAuth,
    authController.strictEmployeeTo(EmployeeType.ADMIN),
    employeeController.searchEmployees
  );

/**
 * @swagger
 * /employees/{employeeId}/toggle-activate:
 *   patch:
 *     summary: Toggle the activation status of an employee.
 *     description: Toggle the activation status (active/inactive) of an employee by their ID.
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         description: ID of the employee to toggle activation status.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Success. Activation status toggled successfully.
 *       '400':
 *         description: Invalid request. The provided employee ID is invalid.
 *       '401':
 *         description: Unauthorized. The user does not have permission to perform this action.
 *       '404':
 *         description: Employee not found. The provided employee ID does not exist.
 *       '500':
 *         description: Internal Server Error. An unexpected error occurred.
 */
router
  .route('/:employeeId/toggle-activate')
  .patch(
    authController.requireEmpAuth,
    authController.strictEmployeeTo(EmployeeType.ADMIN),
    employeeIdParamsValidation,
    validateRequest,
    employeeController.toggleActivateEmp
  );

export { router as employeeRouter };
