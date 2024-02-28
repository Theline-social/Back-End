import { body, param } from 'express-validator';
import { UsersService } from '../../../services/user.service';

const usersService = new UsersService();

export const followingIdParamsValidation = [
  param('followingId')
    .notEmpty()
    .exists()
    .toInt()
    .custom(async (id) => {
      const exists = await usersService.isUserFoundById(id);
      if (!exists) {
        throw new Error('followed user does not exist');
      }
    })
    .withMessage('following user does not exist'),
];

export const mutedIdIdParamsValidation = [
  param('mutedId')
    .notEmpty()
    .exists()
    .toInt()
    .custom(async (id) => {
      const exists = await usersService.isUserFoundById(id);
      if (!exists) {
        throw new Error('muted user does not exist');
      }
    })
    .withMessage('muted user does not exist'),
];

export const blockedIdIdParamsValidation = [
  param('blockedId')
    .notEmpty()
    .exists()
    .toInt()
    .custom(async (id) => {
      const exists = await usersService.isUserFoundById(id);
      if (!exists) {
        throw new Error('blocked user does not exist');
      }
    })
    .withMessage('blocked user does not exist'),
];
