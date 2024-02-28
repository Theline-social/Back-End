import { param } from 'express-validator';
import { ReelsService } from '../../../services/reel.service';

const reelService = new ReelsService();

export const reelIdParamsValidation = [
  param('reelId')
    .exists()
    .toInt()
    .custom(async (id) => {
      const exists = await reelService.exists(id);
      if (!exists) {
        throw new Error('reel Id  does not exist');
      }
    })
    .withMessage('reel does not exist'),
];
