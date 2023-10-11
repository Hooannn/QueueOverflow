import { Controller, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  CreatePostDto,
  QueryDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('post.create')
  async create(
    @Payload() params: { createPostDto: CreatePostDto; createdBy?: string },
  ) {
    try {
      const post = await this.postsService.create(
        params.createPostDto,
        params.createdBy,
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

  @MessagePattern('post.find_all')
  async findAll(@Payload() query: QueryDto) {
    try {
      const { data, total } = await this.postsService.findAll(query);

      return { data, total };
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.find_by_id')
  async findOne(@Payload() id: string) {
    try {
      const post = await this.postsService.findOne(id);
      return post;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.update')
  async update(
    @Payload()
    params: {
      postId: string;
      updatePostDto: UpdatePostDto;
      updatedBy: string;
    },
  ) {
    try {
      const updatedRecord = await this.postsService.update(
        params.postId,
        params.updatePostDto,
        params.updatedBy,
      );

      return updatedRecord;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.remove')
  async remove(
    @Payload()
    params: {
      id: string;
      removedBy: string;
    },
  ) {
    try {
      await this.postsService.remove(params.id, params.removedBy);
      return params.id;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
