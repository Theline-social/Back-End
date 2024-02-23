import { body } from 'express-validator';
import { Gender, OtpProvider } from '../../../entities';
import { emailRegex, passwordRegex } from '../../constants/regex';
import { isPhoneValid } from './user';

const isValidProvider = (value: OtpProvider) => {
  if (![OtpProvider.EMAIL, OtpProvider.PHONE].includes(value)) {
    throw new Error('Invalid provider. Must be either "email" or "phone".');
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
    .matches(/^[a-zA-Z\s]+$/)
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
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Invalid date format. Use YYYY-MM-DD'),

];

export const signinValidationRules = [
  body('email')
    .toLowerCase()
    .notEmpty()
    .isEmail()
    .withMessage('Invalid email address'),
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
