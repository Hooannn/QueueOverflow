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
import { SavedPost } from '@queueoverflow/shared/entities';
import { QueryDto } from '@queueoverflow/shared/dtos';
import { DeleteResult } from 'typeorm';

@Controller({
  version: '1',
  path: 'v1/saved_posts',
})
export class SavedPostsGatewayController {
  constructor(
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
  ) {}

  @Get()
  async findAllSavedPosts(@Query() queryDto: QueryDto, @Req() req) {
    try {
      const { data, total } = await firstValueFrom<{
        data: SavedPost[];
        total?: number;
      }>(
        this.postsClient.send('saved_post.find_all', {
          query: queryDto,
          userId: req.auth?.userId,
        }),
      );

      return new Response<SavedPost[]>({
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

  @Get('id')
  async findAllSavedPostIds(@Req() req) {
    try {
      const data = await firstValueFrom<string[]>(
        this.postsClient.send('saved_post.find_all_id', req.auth?.userId),
      );

      return new Response<string[]>({
        code: 200,
        success: true,
        data,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  async createSavedPost(@Req() req, @Body('post_id') postId: string) {
    try {
      const data = await firstValueFrom<SavedPost>(
        this.postsClient.send('saved_post.create', {
          userId: req.auth?.userId,
          postId,
        }),
      );

      return new Response<SavedPost>({
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
        this.postsClient.send('saved_post.remove', {
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
