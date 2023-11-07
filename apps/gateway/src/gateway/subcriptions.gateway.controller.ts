import {
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Query,
  Req,
  Get,
  Post,
  Delete,
  ParseArrayPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from '@queueoverflow/shared/utils';
import { Subscription } from '@queueoverflow/shared/entities';
import { QueryDto } from '@queueoverflow/shared/dtos';

@Controller({
  version: '1',
  path: 'v1/subscriptions',
})
export class SubscriptionsGatewayController {
  constructor(
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
  ) {}

  @Post('topic/:id')
  async subscribeTopic(@Param('id') id: string, @Req() req) {
    try {
      const res = await firstValueFrom<Subscription>(
        this.postsClient.send('subscription.topic.create', {
          topicId: id,
          userId: req.auth?.userId,
        }),
      );

      return new Response<Subscription>({
        code: 201,
        success: true,
        data: res,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('topic/:id')
  async unsubscribeTopic(@Param('id') id: string, @Req() req) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('subscription.topic.remove', {
          topicId: id,
          userId: req.auth?.userId,
        }),
      );

      return new Response<Subscription>({
        code: 200,
        success: true,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAllSubscriptions(
    @Req() req,
    @Query() queryDto: QueryDto,
    @Query('relations', new ParseArrayPipe({ optional: true }))
    relations?: string[],
  ) {
    try {
      const { data, total } = await firstValueFrom<{
        data: Subscription[];
        total?: number;
      }>(
        this.postsClient.send('subscription.find_by_user', {
          userId: req.auth?.userId,
          queryDto: { ...queryDto, relations },
        }),
      );

      return new Response<Subscription[]>({
        code: 200,
        success: true,
        data,
        took: data.length,
        total,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
