import crypto from 'crypto';
import otpGenerator from 'otp-generator';
import moment from 'moment';

export const createOtp = (
  len: number,
  durationInm: number = 10
): { otp: string; otpExpires: Date; hashedOtp: string } => {
  const otp = otpGenerator.generate(len, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const otpExpires = moment().add(durationInm, 'minutes').toDate();

  return { otp, otpExpires, hashedOtp };
};

export const verifyCode = (code: string, hashedCode: string): boolean => {
  const hashedInputCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');
  return hashedInputCode === hashedCode;
};
