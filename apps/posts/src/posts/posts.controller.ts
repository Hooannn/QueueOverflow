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
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.find_all')
  async findAll(@Payload() query: QueryDto) {
    try {
      const { data, total } = await this.postsService.findAll(query);

      return { data, total };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.find_by_id')
  async findOne(@Payload() id: string) {
    try {
      const post = await this.postsService.findOne(id);
      return post;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.update')
  async update(
    @Payload()
    params: {
      userId: string;
      updatePostDto: UpdatePostDto;
      updatedBy: string;
    },
  ) {
    try {
      const updatedRecord = await this.postsService.update(
        params.userId,
        params.updatePostDto,
        params.updatedBy,
      );

      return updatedRecord;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.remove')
  async remove(@Payload() id: string) {
    try {
      await this.postsService.remove(id);
      return id;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
