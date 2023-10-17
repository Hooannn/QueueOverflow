import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from '@queueoverflow/shared/utils';
import { CreateFcmTokenDto } from '@queueoverflow/shared/dtos';
import { FcmToken } from '@queueoverflow/shared/entities';
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
