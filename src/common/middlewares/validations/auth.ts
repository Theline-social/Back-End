import { body } from 'express-validator';
import {
  EmployeeStatus,
  EmployeeType,
  Gender,
  OtpProvider,
} from '../../../entities';
import { emailRegex, passwordRegex } from '../../constants/regex';
import { isPhoneValid } from './user';

const isValidProvider = (value: OtpProvider) => {
  if (![OtpProvider.EMAIL, OtpProvider.PHONE].includes(value)) {
    throw new Error('Invalid provider. Must be either "email" or "phone".');
  }
  return true;
};

const isValidEmpStatus = (value: EmployeeStatus) => {
  if (![EmployeeStatus.ACTIVE, EmployeeStatus.INACTIVE].includes(value)) {
    throw new Error(
      'Invalid EmployeeStatus. Must be either "active" or "inActive".'
    );
  }
  return true;
};

const isValidEmpType = (value: EmployeeType) => {
  if (![EmployeeType.ADMIN, EmployeeType.EMPLOYEE].includes(value)) {
    throw new Error(
      'Invalid Employee Type. Must be either "employee" or "admin".'
    );
  }
  return true;
};

const isValidEmailOrPhone = (value: string, provider: OtpProvider) => {
  if (provider === OtpProvider.EMAIL && emailRegex.test(value)) {
    return true;
  }

  if (provider === OtpProvider.PHONE && isPhoneValid(value)) {
    return true;
  }

  return false;
};

export const sendOTPVerificationEmailValidationRules = [
  body('provider')
    .isString()
    .toUpperCase()
    .notEmpty()
    .withMessage('Provider is required')
    .custom(isValidProvider),
  body('input')
    .custom((value, { req }) => isValidEmailOrPhone(value, req.body.provider))
    .withMessage('Invalid input'),
  body('name').isString().notEmpty().withMessage('Name is required'),
];

export const checkOTPVerificationEmailValidationRules = [
  body('provider')
    .isString()
    .notEmpty()
    .toUpperCase()
    .withMessage('Provider is required')
    .custom(isValidProvider),
  body('input')
    .custom((value, { req }) => isValidEmailOrPhone(value, req.body.provider))
    .withMessage('Invalid input'),
  body('otp').isString().notEmpty().withMessage('Otp is required'),
];

export const signupValidationRules = [
  body('name')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 2 characters'),
  body('email').toLowerCase().isEmail().withMessage('Invalid email address'),
  body('phoneNumber')
    .notEmpty()
    .custom(isPhoneValid)
    .withMessage('Enter phone number'),
  body('password')
    .isString()
    .matches(passwordRegex)
    .withMessage(
      'Invalid Password, must be at least 8 characters including a special character'
    ),
  body('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('jobtitle').isString().withMessage('jobtitle is required'),
  body('dateOfBirth')
    .custom((val) => {
      const date = Date.parse(val);
      if (date) return true;
      return false;
    })
    .withMessage('Invalid date format. Use YYYY-MM-DD'),
];

export const signupGoogleValidationRules = [
  body('phoneNumber')
    .notEmpty()
    .custom(isPhoneValid)
    .withMessage('Enter phone number'),
  body('jobtitle').isString().withMessage('jobtitle is required'),
  body('dateOfBirth')
    .custom((val) => {
      const date = Date.parse(val);
      if (date) return true;
      return false;
    })
    .withMessage('Invalid date format. Use YYYY-MM-DD'),
  body('googleAccessToken')
    .isString()
    .notEmpty()
    .withMessage('googleAccessToken is required'),
];

export const signinValidationRules = [
  body('input').notEmpty().withMessage('input is required  '),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

export const validateRecaptchaValidationRules = [
  body('gRecaptchaResponse')
    .isString()
    .notEmpty()
    .withMessage('gRecaptchaResponse is required'),
];

export const googleSignValidationRules = [
  body('googleAccessToken')
    .isString()
    .notEmpty()
    .withMessage('googleAccessToken is required'),
];

export const addEmpValidationRules = [
  body('name')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 2 characters'),
  body('email').toLowerCase().isEmail().withMessage('Invalid email address'),
  body('phoneNumber')
    .notEmpty()
    .custom(isPhoneValid)
    .withMessage('Enter phone number'),
  body('status')
    .isString()
    .toUpperCase()
    .notEmpty()
    .withMessage('status is required')
    .custom(isValidEmpStatus),
  body('type')
    .isString()
    .toUpperCase()
    .notEmpty()
    .withMessage('type is required')
    .custom(isValidEmpType),
  body('password')
    .isString()
    .matches(passwordRegex)
    .withMessage(
      'Invalid Password, must be at least 8 characters including a special character'
    ),
];
