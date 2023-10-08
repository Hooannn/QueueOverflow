import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('mail.send.password')
  async sendPasswordEmail(
    @Payload() params: { email: string; password: string },
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.sendGeneratedPasswordMail(
      params.email,
      params.password,
    );
  }

  @EventPattern('mail.send.welcome')
  async sendWelcomeEmail(
    @Payload() params: { email: string },
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.sendWelcomeEmail(params.email);
  }
}
