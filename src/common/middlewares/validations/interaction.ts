import { body, param } from 'express-validator';
import { UsersService } from '../../../services/user.service';

const usersService = new UsersService();

export const followingUsernameParamsValidation = [
  param('followingUsername')
    .notEmpty()
    .exists()
    .custom(async (username) => { 
      const exists = await usersService.isUserFoundByUsername(username);
      if (!exists) {
        throw new Error('following user does not exist');
      }
    })
    .withMessage('following user does not exist'),
];

export const mutedUsernameParamsValidation = [
  param('mutedUsername')
    .notEmpty()
    .exists()
    .custom(async (username) => {
      const exists = await usersService.isUserFoundByUsername(username);
      if (!exists) {
        throw new Error('muted user does not exist');
      }
    })
    .withMessage('muted user does not exist'),
];

export const blockedUsernameParamsValidation = [
  param('blockedUsername')
    .notEmpty()
    .exists()
    .custom(async (username) => {
      const exists = await usersService.isUserFoundByUsername(username);
      if (!exists) {
        throw new Error('blocked user does not exist');
      }
    })
    .withMessage('blocked user does not exist'),
];
