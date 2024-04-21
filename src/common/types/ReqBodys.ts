import { OtpProvider } from '../../entities';
import { EmployeeStatus, EmployeeType } from '../../entities/Employee';

export interface SignupRequestBody {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  jobtitle: string;
  dateOfBirth: Date;
}

export interface SignupGoogleRequestBody {
  phoneNumber: string;
  jobtitle: string;
  dateOfBirth: Date;
  googleAccessToken: string;
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
  input: string;
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

export interface editProfileBody {
  name?: string;
  bio?: string;
  location?: string;
  jobtitle?: string;
  bannerUrl?: string;
  imageUrl?: string;
  dateOfBirth?: Date;
}

export interface addEmplyeeRequestBody {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: EmployeeStatus;
  type: EmployeeType;
}

export interface addJobRequestBody {
  topic: string;
  description: string;
  imageUrls?: string[];
  jobDurationInDays: number;
  availableApplicantsCount: number;
}
