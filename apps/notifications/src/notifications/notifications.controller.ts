import { Controller, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  MessagePattern,
  RpcException,
} from '@nestjs/microservices';
import { CreateFcmTokenDto } from '@queueoverflow/shared/dtos';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

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

  @EventPattern('post.created')
  async notifyPostCreated(
    @Payload() postId: string,
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.notifyPostCreated(postId);
  }

  @MessagePattern('fcm_token.create')
  async createFcmToken(
    @Payload()
    params: {
      userId: string;
      createFcmTokenDto: CreateFcmTokenDto;
    },
  ) {
    try {
      const fcmToken = await this.pushNotificationsService.createFcmToken(
        params.userId,
        params.createFcmTokenDto,
      );

      return fcmToken;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
