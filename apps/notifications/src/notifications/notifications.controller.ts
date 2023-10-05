import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventPattern } from '@nestjs/microservices';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('mail.send.password')
  async sendPasswordEmail(params: { email: string; password: string }) {
    return this.notificationsService.sendGeneratedPasswordMail(
      params.email,
      params.password,
    );
  }

  @EventPattern('mail.send.welcome')
  async sendWelcomeEmail(params: { email: string }) {
    return this.notificationsService.sendWelcomeEmail(params.email);
  }
}
