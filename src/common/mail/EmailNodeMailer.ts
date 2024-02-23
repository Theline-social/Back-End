import axios from 'axios';
import https from 'https';
import { AppError } from '../utils/AppError';

interface User {
  name: string;
  email: string;
}

interface EmailData {
  [key: string]: any;
}

export class Email {
  firstName: string;
  to: string;
  from: string;
  data: EmailData;

  constructor(user: User) {
    this.firstName = user.name.split(' ')[0];
    this.to = user.email;
    this.from = `${process.env.MAILER_AAPANEL_FROM}`;
  }

  private async sendMailAPI(subject: string, data: EmailData) {
    const url = `${process.env.PANEL_ADDRESS}/mail_sys/send_mail_http.json`;

    try {
      axios.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });

      const html = `
        <!-- CONTENT-->
        <p>Hi ${this.firstName},</p>
        <p>Welcome to The Line, we're glad to have you 🎉🙏</p>
        <p>Need to confirm your Email? </p>
        <strong style="color: blue;">Your OTP is ${data.otp}</strong>
        <p>It's valid for 10 minutes</p>
        <hr>
        <p>If you need any help, please don't hesitate to contact us!</p>
        <p>The Line Support Team</p>
      `;
      const resp = await axios.post(url, null, {
        params: {
          mail_from: this.from,
          password: process.env.MAILER_AAPANEL_PASSWORD,
          mail_to: this.to,
          subject: subject,
          content: html,
          subtype: 'html',
        },
      });

      if (resp.status == 200) return true;

      throw new AppError('Error in sending email', 400);
    } catch (error) {
      throw new AppError('Error in sending email', 400);
    }
  }

  async sendConfirmationEmail(otp: string): Promise<void> {
    await this.sendMailAPI('Confirm your email on TheLine', { otp });
  }
}
