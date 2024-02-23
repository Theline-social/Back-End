import {
  AppError,
  ChangePasswordBody,
  Password,
  emailRegex,
  isPhoneValid,
} from '../common';
import { AppDataSource } from '../dataSource';
import { User } from '../entities';

export class UsersService {
  constructor() {}

  changeUsername = async (userId: number, body: { newUsername: string }) => {
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { userId },
    });

    if (!existingUser) throw new AppError(`User ${userId} does not exist`, 404);

    existingUser.username = body.newUsername;
    await userRepository.save(existingUser);
  };

  changePassword = async (userId: number, body: ChangePasswordBody) => {
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { userId },
    });

    if (!existingUser) throw new AppError(`User ${userId} does not exist`, 404);

    const isCorrectPassword = await Password.comparePassword(
      body.currPassword,
      existingUser.password
    );

    if (!isCorrectPassword) throw new AppError('Wrong Current Password', 400);

    const hashedPassword = await Password.hashPassword(body.newPassword);
    existingUser.password = hashedPassword;
    await userRepository.save(existingUser);
  };

  currentAuthedUser = async (userId: number) => {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { userId },
    });

    return { user };
  };

  resetPassword = async (userId: number, body: { newPassword: string }) => {
    const { newPassword } = body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId },
    });

    if (!user) throw new AppError('User not found', 404);

    const hashedPassword = await Password.hashPassword(newPassword);

    user.password = hashedPassword;
    await userRepository.save(user);
  };

  isUserFound = async (body: { input: string }) => {
    const { input } = body;
    let user: User | null = null;
    const userRepository = AppDataSource.getRepository(User);

    if (input.match(emailRegex)) {
      user = await userRepository.findOne({
        where: { email: input },
        select: { email: true, phoneNumber: true },
      });
    } else if (isPhoneValid(input)) {
      user = await userRepository.findOne({
        where: { phoneNumber: input },
        select: { email: true, phoneNumber: true },
      });
    } else {
      user = await userRepository.findOne({
        where: { username: input },
        select: { email: true, phoneNumber: true },
      });
    }

    return {
      isFound: user !== null,
      data: { email: user?.email, phoneNumber: user?.phoneNumber },
    };
  };

}
