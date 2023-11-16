import { Controller, HttpStatus } from '@nestjs/common';
import { SavedPostsService } from './saved_posts.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { QueryDto } from '@queueoverflow/shared/dtos';

@Controller()
export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostsService) {}

  @MessagePattern('saved_post.create')
  async create(@Payload() params: { userId: string; postId: string }) {
    try {
      const post = await this.savedPostsService.create(
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

  @MessagePattern('saved_post.find_all')
  async findAll(@Payload() params: { userId: string; query: QueryDto }) {
    try {
      const { data, total } = await this.savedPostsService.findAll(
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

  @MessagePattern('saved_post.find_all_id')
  async findAllIds(@Payload() userId: string) {
    try {
      const data = await this.savedPostsService.findAllIds(userId);

      return data.map((s) => s.post_id);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('saved_post.remove')
  async findOne(@Payload() params: { userId: string; postId: string }) {
    try {
      return await this.savedPostsService.remove(params.userId, params.postId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
