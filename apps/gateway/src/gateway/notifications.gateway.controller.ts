import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from '@queueoverflow/shared/utils';
import { CreateFcmTokenDto, QueryDto } from '@queueoverflow/shared/dtos';
import { FcmToken, Notification } from '@queueoverflow/shared/entities';
import { firstValueFrom } from 'rxjs';

@Controller({
  version: '1',
  path: 'v1/notifications',
})
export class NotificationsGatewayController {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  @Patch('mark-all')
  async markAllAsRead(@Req() req) {
    try {
      await firstValueFrom<unknown>(
        this.notificationsClient.send(
          'notification.mark_all',
          req.auth?.userId,
        ),
      );

      return new Response<unknown>({
        code: 200,
        success: true,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('mark/:id')
  async markAsRead(@Req() req, @Param('id') notificationId: string) {
    try {
      await firstValueFrom<unknown>(
        this.notificationsClient.send('notification.mark_by_id', {
          userId: req.auth?.userId,
          notificationId,
        }),
      );

      return new Response<unknown>({
        code: 200,
        success: true,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') notificationId: string) {
    try {
      const data = await firstValueFrom<Notification>(
        this.notificationsClient.send('notification.find_by_id', {
          userId: req.auth?.userId,
          notificationId,
        }),
      );

      return new Response<Notification>({
        code: 200,
        success: true,
        data,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(
    @Req() req,
    @Query() queryDto: QueryDto,
    @Query('relations', new ParseArrayPipe({ optional: true }))
    relations?: string[],
  ) {
    try {
      const { data, total } = await firstValueFrom<{
        data: Notification[];
        total?: number;
      }>(
        this.notificationsClient.send('notification.find_all', {
          userId: req.auth?.userId,
          queryDto: { ...queryDto, relations },
        }),
      );

      return new Response<Notification[]>({
        code: 200,
        success: true,
        total,
        took: data.length,
        data,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('unread/count')
  async countUnread(@Req() req) {
    try {
      const data = await firstValueFrom<number>(
        this.notificationsClient.send(
          'notification.count_unread',
          req.auth?.userId,
        ),
      );

      return new Response<number>({
        code: 200,
        success: true,
        data,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/fcm/token')
  async createFcmToken(
    @Req() req,
    @Body() createFcmTokenDto: CreateFcmTokenDto,
  ) {
    try {
      const res = await firstValueFrom<FcmToken>(
        this.notificationsClient.send('fcm_token.create', {
          userId: req.auth?.userId,
          createFcmTokenDto,
        }),
      );

      return new Response<FcmToken>({
        code: 201,
        success: true,
        message: 'Created',
        data: res,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
