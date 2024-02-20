import nodemailer, { Transporter } from 'nodemailer';
import { htmlToText } from 'html-to-text';
import pug from 'pug';

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

  constructor(user: User, data: EmailData = {}) {
    this.firstName = user.name.split(' ')[0];
    this.to = user.email;
    this.from = `TheLine <${process.env.MAIL_FROM}>`;
    this.data = data;
  }

  private newTransport(): Transporter {
    if (process.env.NODE_ENV == 'production') {
      return nodemailer.createTransport({
        host: process.env.SENDINBLUE_SERVER,
        secure: true,
        port: Number(process.env.SENDINBLUE_PORT),
        auth: {
          user: process.env.SENDINBLUE_USER,
          pass: process.env.SENDINBLUE_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendEmail(template: string, subject: string): Promise<void> {
    const html = pug.renderFile(`${__dirname}/templates/${template}.pug`, {
      firstName: this.firstName,
      subject,
      data: this.data,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendConfirmationEmail(): Promise<void> {
    await this.sendEmail('confirmEmail', 'Confirm your email on TheLine');
  }

  async sendConfirmationUpdateEmail(): Promise<void> {
    await this.sendEmail('updateEmail', 'Confirm your email on TheLine');
  }
}
