import { Controller, HttpStatus } from '@nestjs/common';
import { PostSubscriptionsService } from './post_subscriptions.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { QueryDto } from '@queueoverflow/shared/dtos';

@Controller()
export class PostSubscriptionsController {
  constructor(
    private readonly postSubscriptionsService: PostSubscriptionsService,
  ) {}

  @MessagePattern('post_subscription.create')
  async create(@Payload() params: { userId: string; postId: string }) {
    try {
      const post = await this.postSubscriptionsService.create(
        params.userId,
        params.postId,
      );

      return post;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post_subscription.find_all')
  async findAll(@Payload() params: { userId: string; query: QueryDto }) {
    try {
      const { data, total } = await this.postSubscriptionsService.findAll(
        params.query,
        params.userId,
      );

      return { data, total };
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post_subscription.find_by_post_id')
  async findByPostId(@Payload() postId: string) {
    try {
      const data = await this.postSubscriptionsService.findByPostId(postId);

      return data;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post_subscription.remove')
  async findOne(@Payload() params: { userId: string; postId: string }) {
    try {
      return await this.postSubscriptionsService.remove(
        params.userId,
        params.postId,
      );
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
