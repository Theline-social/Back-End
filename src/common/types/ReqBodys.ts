import { Gender, OtpProvider } from '../../entities';

export interface SignupRequestBody {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  jobtitle: string;
  dateOfBirth: Date;
  gender: Gender;
}

export interface CheckValidOtpBody {
  otp: string;
  input: string;
  provider: OtpProvider;
}

export interface SendConfirmOtpBody {
  name: string;
  input: string;
  provider: OtpProvider;
}

export interface SignedInOtpBody {
  email: string;
  password: string;
}


export interface ChangePasswordBody {
    currPassword: string;
    newPassword: string;
}