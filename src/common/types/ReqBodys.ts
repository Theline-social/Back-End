import { OtpProvider } from '../../entities';

export interface SignupRequestBody {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  jobtitle: string;
  dateOfBirth: Date;
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

export interface AddTopicBody {
  description_ar: string;
  description_en: string;
  topic_en: string;
  topic_ar: string;
}
