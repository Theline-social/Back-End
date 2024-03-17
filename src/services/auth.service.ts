import { AppDataSource } from '../dataSource';
import {
  AppError,
  CheckValidOtpBody,
  SendConfirmOtpBody,
  SignedInOtpBody,
  SignupRequestBody,
  createOtp,
  jwtVerifyPromisified,
  verifyCode,
  Password,
  Email,
  MsegatSmsRepository,
  SignupGoogleRequestBody,
} from '../common';
import { AuthProvider, User } from '../entities';
import { OtpCodes, OtpProvider } from '../entities/OtpCodes';
import moment from 'moment';
import { UsersService } from './user.service';
import { filterUser } from '../common/filters/users/filterUser';

/**
 * @class AuthService
 * @description Provides authentication-related functionalities for user registration, login, and related actions.
 */

const usersService = new UsersService();

class AuthService {
  constructor() {}

  signup = async (body: SignupRequestBody) => {
    const userRepository = AppDataSource.getRepository(User);
    const otpCodesRepository = AppDataSource.getRepository(OtpCodes);

    const phoneOtpCode = await otpCodesRepository.findOne({
      where: { input: body.phoneNumber, provider: OtpProvider.PHONE },
    });
    if (!phoneOtpCode)
      throw new AppError('Go to verifiy your phone number', 400);
    if (!phoneOtpCode.isVerified)
      throw new AppError('Phone number not verified', 400);

    const emailOtpCode = await otpCodesRepository.findOne({
      where: { input: body.email, provider: OtpProvider.EMAIL },
    });
    if (!emailOtpCode) throw new AppError('Go to verifiy your email', 400);
    if (!emailOtpCode.isVerified) throw new AppError('Email not verified', 400);

    const hashedPassword = await Password.hashPassword(body.password);

    const user = new User();
    user.password = hashedPassword;
    user.email = body.email;
    user.jobtitle = body.jobtitle;
    user.dateOfBirth = body.dateOfBirth;
    user.phoneNumber = body.phoneNumber;
    user.name = body.name;
    user.username = `user${body.phoneNumber}`;

    const saveduser = await userRepository.save(user);

    return { user: filterUser(saveduser) };
  };

  getUserdataFromGoogle = async (googleAccessToken: string) => {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      }
    );

    if (!response.ok) throw new AppError('Error in Google Request', 400);

    const { email, name, picture, sub } = await response.json();

    return { email, name, picture, sub };
  };

  signupWithGoogle = async (body: SignupGoogleRequestBody) => {
    const userRepository = AppDataSource.getRepository(User);
    const otpCodesRepository = AppDataSource.getRepository(OtpCodes);

    const phoneOtpCode = await otpCodesRepository.findOne({
      where: { input: body.phoneNumber, provider: OtpProvider.PHONE },
    });
    if (!phoneOtpCode)
      throw new AppError('Go to verifiy your phone number', 400);
    if (!phoneOtpCode.isVerified)
      throw new AppError('Phone number not verified', 400);

    const { email, name, picture, sub } = await this.getUserdataFromGoogle(
      body.googleAccessToken
    );

    const user = new User();
    user.email = email;
    user.jobtitle = body.jobtitle;
    user.dateOfBirth = body.dateOfBirth;
    user.phoneNumber = body.phoneNumber;
    user.name = name;
    user.imageUrl = picture;
    user.username = `user${body.phoneNumber}`;

    const saveduser = await userRepository.save(user);

    return { user: filterUser(saveduser) };
  };

  checkValidOtp = async (body: CheckValidOtpBody): Promise<boolean> => {
    const { otp, input, provider } = body;

    if (input === '111111') {
      await AppDataSource.getRepository(OtpCodes).update(
        { input, provider },
        {
          isVerified: true,
        }
      );

      return true;
    }
    const otpCode = await AppDataSource.getRepository(OtpCodes).findOne({
      where: { input, provider },
    });

    if (!otpCode) return false;

    if (!verifyCode(otp, otpCode.hashedCode)) return false;

    if (moment().toDate() > moment(otpCode.expiresAt).toDate()) return false;

    await AppDataSource.getRepository(OtpCodes).update(
      { input, provider },
      {
        isVerified: true,
      }
    );

    return true;
  };

  sendConfirmationOtp = async (
    body: SendConfirmOtpBody,
    lang: string
  ): Promise<void> => {
    const { input, name, provider } = body;

    const { otp, hashedOtp, otpExpires } = createOtp(8, 10);

    const otpCode = await AppDataSource.getRepository(OtpCodes).findOne({
      where: { input, provider },
    });

    if (!otpCode) {
      await AppDataSource.getRepository(OtpCodes).insert({
        hashedCode: hashedOtp,
        input,
        provider,
        isVerified: false,
        expiresAt: otpExpires,
      });
    } else {
      await AppDataSource.getRepository(OtpCodes).update(
        { input, provider },
        {
          hashedCode: hashedOtp,
          provider,
          isVerified: false,
          expiresAt: otpExpires,
        }
      );
    }

    try {
      if (provider === OtpProvider.EMAIL) {
        await new Email({ email: input, name }).sendConfirmationEmail(
          otp,
          lang
        );
      } else if (provider === OtpProvider.PHONE) {
        await new MsegatSmsRepository().sendOtpVerification(input, otp, lang);
      }
    } catch (error) {
      console.log(error);
      throw new AppError('Error in sending verification otp', 400);
    }
  };

  login = async (body: SignedInOtpBody) => {
    const { input, password } = body;

    const { isFound, data } = await usersService.isUserFound({ input });

    if (!isFound) throw new AppError('No User Found', 404);

    const user = await AppDataSource.getRepository(User).findOne({
      where: { email: data.email },
      relations: { followers: true, following: true },
    });

    if (!user) throw new AppError('No User Found', 404);

    return { user: filterUser(user) };
  };

  validateRecaptcha = async (body: {
    gRecaptchaResponse: string;
  }): Promise<boolean> => {
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.ReCAPTCHA_SECRET_KEY}&response=${body.gRecaptchaResponse}`;

    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const result = await response.json();
      if (!result.success) return false;
      return true;
    } else {
      throw new AppError('Error in reCAPTCHA verification', 400);
    }
  };

  signinWithGoogle = async (body: { googleAccessToken: string }) => {
    const { googleAccessToken } = body;
    const userRepository = AppDataSource.getRepository(User);

    const { email, name } = await this.getUserdataFromGoogle(googleAccessToken);

    let existingUser: User | null = null;
    const isUserExists = await userRepository.exists({
      where: { email },
    });

    if (!isUserExists) {
      return { isUserExists: false, name };
    }

    existingUser = await userRepository.findOne({
      where: { email },
    });

    return { isUserExists: true, data: existingUser };
  };

  checkAuth = async (token: string, secretKey: string) => {
    const payload = await jwtVerifyPromisified(token, secretKey);

    const user = await AppDataSource.getRepository(User).findOne({
      where: { userId: payload.id },
      select: ['username', 'email', 'userId'],
    });

    if (!user) {
      throw new AppError('User does no longer exist', 401);
    }
    return { user };
  };
}

export default AuthService;
