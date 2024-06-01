import axios from 'axios';
import https from 'https';
import { AppError } from '../utils/AppError';
import { SubscriptionType } from '../../entities';

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
  }

  private async sendMailAPI(subject: string, data: EmailData) {
    const url = `${process.env.PANEL_ADDRESS}/mail_sys/send_mail_http.json`;

    try {
      axios.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });


      console.log(data);
      
      const resp = await axios.post(url, null, {
        params: {
          mail_from: data.mailFrom,
          password: data.password,
          mail_to: this.to,
          subject: subject,
          content: data.html,
          subtype: 'html',
        },
      });
      

      console.log(resp);
      
      if (resp.status == 200) return true;

      throw new AppError('Error in sending email', 400);
    } catch (error) {
      throw new AppError('Error in sending email', 400);
    }
  }

  async sendConfirmationEmail(otp: string, lang: string): Promise<void> {
    let html;
    if (lang === 'ar') {
      html = `
      <div dir="rtl">
          <!-- CONTENT-->
          <p>مرحبا ${this.firstName}،</p>
          <p>نرحب بك في ذا لاين، نحن سعداء بوجودك 🎉🙏</p>
          <p>هل تحتاج إلى تأكيد بريدك الإلكتروني؟</p>
          <strong style="color: blue;">الرمز الخاص بك هو ${otp}</strong>
          <p>صالح لمدة 10 دقائق</p>
          <p>فريق دعم ذا لاين</p>
          <p>إذا كنت بحاجة إلى مساعدة، فلا تتردد في الاتصال بنا!</p>
      </div>
      `;
    } else {
      html = `
        <!-- CONTENT-->
        <p>Hi ${this.firstName},</p>
        <p>Welcome to The Line, we're glad to have you 🎉🙏</p>
        <p>Need to confirm your Email? </p>
        <strong style="color: blue;">Your OTP is ${otp}</strong>
        <p>It's valid for 10 minutes</p>
        <p>If you need any help, please don't hesitate to contact us!</p>
        <p>The Line Support Team</p>
      `;
    }

    await this.sendMailAPI('Confirm your email on TheLine', {
      html,
      password: process.env.VERIFY_MAILER_PASSWORD,
      mailFrom: process.env.VERIFY_MAILER_FROM,
    });
  }

  async sendSubscriptionEmail(
    lang: string,
    type: SubscriptionType
  ): Promise<void> {
    let html;
    let subscriptionTitle;
    switch (type) {
      case SubscriptionType.INTERESTED:
        subscriptionTitle =
          lang === 'ar' ? 'مشترك مهتم' : 'Interested Subscriber';
        break;
      case SubscriptionType.PROFESSIONAL:
        subscriptionTitle =
          lang === 'ar' ? 'مشترك مختص' : 'Professional Subscriber';
        break;
      case SubscriptionType.BUSINESS:
        subscriptionTitle =
          lang === 'ar' ? 'مشترك أعمال' : 'Business Subscriber';
        break;
      default:
        subscriptionTitle = lang === 'ar' ? 'مشترك' : 'Subscriber';
    }

    if (lang === 'ar') {
      html = `
        <div dir="rtl">
            <!-- CONTENT-->
            <p>.مرحباً بك في رحلة الإبداع يسعدنا بأن تكون من ضمن طاقم روّاد ذا لاين.</p>

            <p>نرجو تزويدنا بالمعلومات التالية لتفعيل الاشتراك وذلك عبر إرفاقهم في رد على هذا البريد وقد تتلقى اتصال هاتفي لتأكيد
            المعلومات, وتستغرق عملية التفعيل ( 15 يوم عمل ) </p>
         


            <h3>${subscriptionTitle}:</h3>
            <ul>
                <li>اثبات هوية شخصية سارية المفعول</li>
                
                ${
                  type === SubscriptionType.INTERESTED
                    ? '<li>اثبات العنوان الوطني</li>'
                    : ''
                }
                ${
                  type === SubscriptionType.PROFESSIONAL
                    ? '<li>اثبات العنوان الوطني</li><li>اثبات التخصص كما هو موضح في حسابك</li>'
                    : ''
                }
                ${
                  type === SubscriptionType.BUSINESS
                    ? '<li>اثبات النشاط ساري المفعول كما هو موضح في حسابك</li><li>اثبات هوية الموثق سارية المفعول</li><li>اثبات الصلاحية للموثق</li>'
                    : ''
                }
            </ul>

        </div>
        `;
    } else {
      html = `
        <!-- CONTENT-->
        <p>Hi ${this.firstName},</p>
        <p>To activate your subscription, we require some information from you</p>

        <p>You may receive a phone call to confirm the information. The activation process takes a maximum of 15 work days. Your subscription will start from the activation date.</p>

        <h3>For ${subscriptionTitle}:</h3>
        <ul>
            <li>A copy of your valid government-issued ID</li>
            
            ${
              type === SubscriptionType.INTERESTED
                ? '<li>A copy of your national address</li>'
                : ''
            }
            ${
              type === SubscriptionType.PROFESSIONAL
                ? '<li>A copy of your national address</li><li>Proof of your specialization as mentioned in your account</li> '
                : ''
            }
            ${
              type === SubscriptionType.BUSINESS
                ? '<li>Proof of active business activity as mentioned in your account</li><li>Proof of the authority</li>'
                : ''
            }
        </ul>

        <p>Please attach this information in a reply to this email.</p>
        `;
    }

    await this.sendMailAPI('Activation Accounts', {
      html,
      password: process.env.SUBSCRIPTION_MAILER_PASSWORD,
      mailFrom: process.env.SUBSCRIPTION_MAILER_FROM,
    });
  }
}
