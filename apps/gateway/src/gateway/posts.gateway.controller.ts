import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  Get,
  Post,
  ParseArrayPipe,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreatePostDto,
  QueryDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';
import { Post as QPost } from '@queueoverflow/shared/entities';
import { firstValueFrom } from 'rxjs';
import { Response } from '@queueoverflow/shared/utils';

@Controller({
  version: '1',
  path: 'v1/posts',
})
export class PostsGatewayController {
  constructor(
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
  ) {}

  @Post()
  async createPost(@Req() req, @Body() createPostDto: CreatePostDto) {
    try {
      const post = await firstValueFrom<QPost>(
        this.postsClient.send('post.create', {
          createPostDto,
          createdBy: req.auth?.userId,
        }),
      );

      return new Response<QPost>({
        code: 201,
        success: true,
        message: 'Created',
        data: post,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  async updatePost(
    @Req() req,
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: string,
  ) {
    try {
      const post = await firstValueFrom<QPost>(
        this.postsClient.send('post.update', {
          postId: id,
          updatePostDto,
          updatedBy: req.auth?.userId,
        }),
      );

      return new Response<QPost>({
        code: 200,
        success: true,
        message: 'Updated',
        data: post,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAllPosts(
    @Query() queryDto: QueryDto,
    @Query('relations', new ParseArrayPipe({ optional: true }))
    relations?: string[],
  ) {
    try {
      const { data, total } = await firstValueFrom<{
        data: QPost[];
        total?: number;
      }>(this.postsClient.send('post.find_all', { ...queryDto, relations }));

      return new Response<QPost[]>({
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const post = await firstValueFrom<QPost>(
        this.postsClient.send('post.find_by_id', id),
      );

      return new Response<QPost>({
        code: 200,
        success: true,
        data: post,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    try {
      const removedId = await firstValueFrom<string>(
        this.postsClient.send('post.remove', {
          id,
          removedBy: req.auth?.userId,
        }),
      );

      return new Response<{ id: string }>({
        code: 200,
        success: true,
        data: { id: removedId },
        message: 'Deleted',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
