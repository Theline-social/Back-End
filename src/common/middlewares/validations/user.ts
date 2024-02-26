import { body, param } from 'express-validator';
import { passwordRegex } from '../../constants/regex';
import phoneNumberUtil from 'google-libphonenumber';
import { UsersService } from '../../../services/user.service';

const phoneUtil = phoneNumberUtil.PhoneNumberUtil.getInstance();

const usersService = new UsersService();

export const isPhoneValid = (phone: string) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

export const changeUsernameValidationRules = [
  body('newUsername').isString().notEmpty().withMessage('username is required'),
];

export const isuserFoundValidationRules = [
  body('input')
    .isString()
    .notEmpty()
    .withMessage('username or phone or email is required'),
];

export const changePasswordValidationRules = [
  body('currPassword')
    .isString()
    .notEmpty()
    .withMessage('current Password is required'),
  body('newPassword')
    .isString()
    .matches(passwordRegex)
    .withMessage(
      'Invalid Password, must be at least 8 characters including a special character'
    ),
  body('newPasswordConfirm').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

export const resetPasswordValidationRules = [
  body('newPassword')
    .isString()
    .matches(passwordRegex)
    .withMessage(
      'Invalid Password, must be at least 8 characters including a special character'
    ),
  body('newPasswordConfirm').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

export const userIdParamsValidation = [
  param('userId')
    .exists()
    .toInt()
    .custom(async (id) => {
      const exists = await usersService.isUserFoundById(id);
      if (!exists) {
        throw new Error('user does not exist');
      }
    })
    .withMessage('userId is required'),
];
