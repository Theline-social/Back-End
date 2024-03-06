import { AppError } from '../common';
import { AppDataSource } from '../dataSource';
import { NotificationType, User } from '../entities';

import socketService from './socket.service';


export class InteractionsService {
  constructor() {}

  toggleFollow = async (userId: number, followingUsername: string) => {
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({
      where: { userId },
      relations: { following: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const userIndex = user.following.findIndex(
      (user) => user.username === followingUsername
    );

    if (userIndex !== -1) {
      user.following.splice(userIndex, 1);
    } else {
      let followingUser = (await userRepository.findOne({
        where: { username: followingUsername },
        select: { userId: true },
      })) as User;

      user.following.push(followingUser);
      await socketService.emitNotification(userId,followingUsername,NotificationType.Follow)
    }

    await userRepository.save(user);
  };

  toggleBlock = async (userId: number, blockedUsername: string) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      relations: { blocking: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const userIndex = user.blocking.findIndex(
      (user) => user.username === blockedUsername
    );

    if (userIndex !== -1) {
      user.blocking.splice(userIndex, 1);
    } else {
      let blockeduser = (await userRepository.findOne({
        where: { username: blockedUsername },
        select: { userId: true },
      })) as User;
      user.blocking.push(blockeduser);
    }

    await userRepository.save(user);
  };

  toggleMute = async (userId: number, mutedUsername: string) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      relations: { muting: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const userIndex = user.muting.findIndex(
      (user) => user.username === mutedUsername
    );

    if (userIndex !== -1) {
      user.muting.splice(userIndex, 1);
    } else {
      let mutedUser = (await userRepository.findOne({
        where: { username: mutedUsername },
        select: { userId: true },
      })) as User;
      user.muting.push(mutedUser);
    }

    await userRepository.save(user);
  };
}
