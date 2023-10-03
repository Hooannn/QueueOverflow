import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { registerTemplate } from 'src/mailer/templates/password';
import { welcomeTemplate } from 'src/mailer/templates/welcome';

@Injectable()
export class NotificationsService {
  constructor(private readonly mailerService: MailerService) {}
  private async sendMail(mailOptions: ISendMailOptions) {
    return this.mailerService.sendMail(mailOptions);
  }

  async sendGeneratedPasswordMail(email: string, password: string) {
    const mailOptions: ISendMailOptions = {
      to: email,
      subject: 'Register account - QueueOverflow',
      html: registerTemplate(password),
    };
    return await this.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string) {
    const mailOptions: ISendMailOptions = {
      to: email,
      subject: 'Welcome - QueueOverflow',
      html: welcomeTemplate(),
    };
    return await this.sendMail(mailOptions);
  }
}
