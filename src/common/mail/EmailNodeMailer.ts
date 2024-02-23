import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';
import pug from 'pug';
import axios from 'axios';
import https from 'https';

interface User {
  name: string;
  email: string;
}

interface EmailData {
  [key: string]: any;
}

interface MailData {
  subject: string;
  content: string;
}

export class Email {
  firstName: string;
  to: string;
  from: string;
  data: EmailData;

  constructor(user: User, data: EmailData = {}) {
    this.firstName = user.name.split(' ')[0];
    this.to = user.email;
    this.from = `${process.env.MAILER_AAPANEL_FROM}`;
    this.data = data;
  }

  private async sendMailAPI(mailData: MailData) {
    const { subject, content } = mailData;

    const url = `${process.env.PANEL_ADDRESS}/mail_sys/send_mail_http.json`;

    try {
      axios.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });

      const resp = await axios.post(url, {
        mail_from: this.from,
        password: process.env.MAILER_AAPANEL_PASSWORD,
        mail_to: this.to,
        subject: subject,
        content: content,
        subtype: 'html',
      });

      console.log(resp.data);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendEmail(template: string, subject: string): Promise<void> {
    const html = pug.renderFile(`${__dirname}/templates/${template}.pug`, {
      firstName: this.firstName,
      subject,
      data: this.data,
    });

    if (process.env.NODE_ENV == 'development') {
      await this.sendMailAPI({ content: html, subject });
    }

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail(mailOptions);
  }

  async sendConfirmationEmail(): Promise<void> {
    await this.sendEmail('confirmEmail', 'Confirm your email on TheLine');
  }

  async sendConfirmationUpdateEmail(): Promise<void> {
    await this.sendEmail('updateEmail', 'Confirm your email on TheLine');
  }
}
