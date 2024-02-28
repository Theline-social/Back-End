import { AppError } from '../common';
import { AppDataSource } from '../dataSource';
import { User } from '../entities';

export class InteractionsService {
  constructor() {}

  toggleFollow = async (userId: number, followingId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({
      where: { userId },
      relations: { following: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const userIndex = user.following.findIndex(
      (user) => user.userId === followingId
    );

    if (userIndex !== -1) {
      user.following.splice(userIndex, 1);
    } else {
      let follwingUser = new User();
      follwingUser.userId = followingId;
      user.following.push(follwingUser);
    }

    await userRepository.save(user);
  };

  toggleBlock = async (userId: number, blockedId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      relations: { blocking: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const userIndex = user.blocking.findIndex(
      (user) => user.userId === blockedId
    );

    if (userIndex !== -1) {
      user.blocking.splice(userIndex, 1);
    } else {
      let blockeduser = new User();
      blockeduser.userId = blockedId;
      user.blocking.push(blockeduser);
    }

    await userRepository.save(user);
  };

  toggleMute = async (userId: number, mutedId: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
      relations: { muting: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const userIndex = user.muting.findIndex((user) => user.userId === mutedId);

    if (userIndex !== -1) {
      user.muting.splice(userIndex, 1);
    } else {
      let mutedUser = new User();
      mutedUser.userId = mutedId;
      user.muting.push(mutedUser);
    }

    await userRepository.save(user);
  };
}
