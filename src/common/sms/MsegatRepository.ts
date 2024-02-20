import axios from 'axios';
import SmsRepository from './SmsRepository';

export class MsegatSmsRepository implements SmsRepository {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly userName: string;
  private readonly userSender: string;

  constructor() {
    this.baseUrl = 'https://www.msegat.com/gw';
    this.apiKey = process.env.MSEGAT_API_KEY as string;
    this.userName = process.env.MSEGAT_USERNAME as string;
    this.userSender = process.env.MSEGAT_USERSENDER as string;
  }

  async sendSms(to: string, body: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/sendsms.php`, {
        userName: this.userName,
        msg: body,
        userSender: this.userSender,
        numbers: to,
        apiKey: this.apiKey,
      });

      return response.data;
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  async sendOtpVerification(to: string, otp: string) {
    return await this.sendSms(to, `You OTP verification is ${otp}`);
  }

  async sendVerify(to: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/sendOTPCode.php`, {
        lang: 'En',
        userName: this.userName,
        number: to,
        apiKey: this.apiKey,
        userSender: this.userSender,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending OTP code:', error);
      return { code: -1, message: 'Error Sending OTP code' };
    }
  }

  async verify(id: string, code: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/verifyOTPCode.php`, {
        lang: 'En',
        userName: this.userName,
        apiKey: this.apiKey,
        code,
        id,
        userSender: this.userSender,
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP code:', error);
      return { code: -1, message: 'Error verifying OTP code' };
    }
  }
}
