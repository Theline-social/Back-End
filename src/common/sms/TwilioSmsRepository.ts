import { Twilio } from 'twilio';
import SmsRepository from './SmsRepository';

export class TwilioSmsRepository implements SmsRepository {
  private readonly twilioClient: Twilio;
  private readonly twilioPhoneNumber: string;
  constructor() {
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendSms(to: string, body: string): Promise<void> {
    await this.twilioClient.messages.create({
      to,
      body,
      from: this.twilioPhoneNumber,
    });
  }

  async sendVerificationOtpSms(to: string, otp: string, expiresAtInm: number) {
    await this.sendSms(
      to,
      `(TheLine) You Otp Verification is ${otp}. It Will Expire in 10 minutes`
    );
  }

  public async verify(to: string, code: string): Promise<boolean> {
    const verificationCheck = await this.twilioClient.verify.v2
      .services(process.env.TWILIO_SERVICE_ID as string)
      .verificationChecks.create({
        to: `+2${to}`,
        code,
      });
    return verificationCheck.status === 'approved';
  }

  public async sendVerify(to: string): Promise<boolean> {
    const verification = await this.twilioClient.verify.v2
      .services(process.env.TWILIO_SERVICE_ID as string)
      .verifications.create({ to: `+2${to}`, channel: 'sms' });
    return verification.status === 'pending';
  }
}
