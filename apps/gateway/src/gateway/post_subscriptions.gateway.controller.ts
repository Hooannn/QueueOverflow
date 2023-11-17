import {
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Query,
  Get,
  Req,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from '@queueoverflow/shared/utils';
import { PostSubscription } from '@queueoverflow/shared/entities';
import { QueryDto } from '@queueoverflow/shared/dtos';
import { DeleteResult } from 'typeorm';

@Controller({
  version: '1',
  path: 'v1/post_subscriptions',
})
export class PostSubscriptionsGatewayController {
  constructor(
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
  ) {}

  @Get()
  async findAllSubscriptions(@Query() queryDto: QueryDto, @Req() req) {
    try {
      const { data, total } = await firstValueFrom<{
        data: PostSubscription[];
        total?: number;
      }>(
        this.postsClient.send('post_subscription.find_all', {
          query: queryDto,
          userId: req.auth?.userId,
        }),
      );

      return new Response<PostSubscription[]>({
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

  @Post()
  async createPostSubscription(@Req() req, @Body('post_id') postId: string) {
    try {
      const data = await firstValueFrom<PostSubscription>(
        this.postsClient.send('post_subscription.create', {
          userId: req.auth?.userId,
          postId,
        }),
      );

      return new Response<PostSubscription>({
        code: 201,
        success: true,
        message: 'Created',
        data,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('post/:postId')
  async remove(@Param('postId') postId: string, @Req() req) {
    try {
      const data = await firstValueFrom<DeleteResult>(
        this.postsClient.send('post_subscription.remove', {
          userId: req.auth?.userId,
          postId,
        }),
      );

      return new Response<DeleteResult>({
        code: 200,
        success: true,
        data,
        message: 'Deleted',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
