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
import { CreateFcmTokenDto, QueryDto } from '@queueoverflow/shared/dtos';
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

  @EventPattern('user.followed')
  async notifyUserFollowed(
    @Payload() params: { from_uid: string; to_uid: string },
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.notifyUserFollowed(
      params.from_uid,
      params.to_uid,
    );
  }

  @EventPattern('user.unfollowed')
  async notifyUserUnfollowed(
    @Payload() params: { from_uid: string; to_uid: string },
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.notifyUserUnfollowed(
      params.from_uid,
      params.to_uid,
    );
  }

  @EventPattern('post.created')
  async notifyPostCreated(
    @Payload() postId: string,
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.notifyPostCreated(postId);
  }

  @EventPattern('comment.created')
  async notifyCommentCreated(
    @Payload() params: { postId: string; commentId: string },
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.notifyCommentCreated(
      params.postId,
      params.commentId,
    );
  }

  @EventPattern('comment.removed')
  async notifyCommentRemoved(
    @Payload() params: { postId: string; commentId: string; userId: string },
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.notifyCommentRemoved(
      params.postId,
      params.commentId,
      params.userId,
    );
  }

  @EventPattern('comment.updated')
  async notifyCommentUpdated(
    @Payload() params: { postId: string; commentId: string; userId: string },
    @Ctx() context: RmqContext,
  ) {
    return this.notificationsService.notifyCommentUpdated(
      params.postId,
      params.commentId,
      params.userId,
    );
  }

  @MessagePattern('fcm_token.remove')
  async removeFcmToken(
    @Payload()
    params: {
      userId: string;
      client: 'web' | 'ios' | 'android';
    },
  ) {
    try {
      const res = await this.pushNotificationsService.removeFcmToken(
        params.userId,
        params.client,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
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

  @EventPattern('notification.find_all')
  async findAll(
    @Payload()
    params: {
      userId: string;
      queryDto: QueryDto;
    },
    @Ctx() context: RmqContext,
  ) {
    try {
      const res = await this.notificationsService.findAll(
        params.userId,
        params.queryDto,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @EventPattern('notification.delete_all')
  async deleteAll(
    @Payload()
    userId: string,
    @Ctx() context: RmqContext,
  ) {
    try {
      const res = await this.notificationsService.deleteAll(userId);

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @EventPattern('notification.find_by_id')
  async findOne(
    @Payload()
    params: {
      userId: string;
      notificationId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    try {
      const res = await this.notificationsService.findOne(
        params.userId,
        params.notificationId,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @EventPattern('notification.count_unread')
  async countUnread(
    @Payload()
    userId: string,
    @Ctx() context: RmqContext,
  ) {
    try {
      const res = await this.notificationsService.countUnread(userId);

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @EventPattern('notification.mark_all')
  async markAllAsRead(@Payload() userId: string, @Ctx() context: RmqContext) {
    try {
      const res = await this.notificationsService.markAllAsRead(userId);

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @EventPattern('notification.mark_by_id')
  async markAsRead(
    @Payload()
    params: {
      userId: string;
      notificationId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    try {
      const res = await this.notificationsService.markAsRead(
        params.userId,
        params.notificationId,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
