import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Req,
  Post,
  Delete,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateCommentDto, UpdateCommentDto } from '@queueoverflow/shared/dtos';
import { Comment } from '@queueoverflow/shared/entities';
import { firstValueFrom } from 'rxjs';
import { Response } from '@queueoverflow/shared/utils';

@Controller({
  version: '1',
  path: 'v1/comments',
})
export class CommentsGatewayController {
  constructor(
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
  ) {}

  @Post('upvote/:id')
  async upvote(@Param('id') id: string, @Req() req) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.upvote.create', {
          commentId: id,
          userId: req.auth?.userId,
        }),
      );

      return new Response<unknown>({
        code: 201,
        success: true,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('upvote/:id')
  async removeUpvote(@Param('id') id: string, @Req() req) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.upvote.remove', {
          commentId: id,
          userId: req.auth?.userId,
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

  @Post('downvote/:id')
  async downvote(@Param('id') id: string, @Req() req) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.downvote.create', {
          commentId: id,
          userId: req.auth?.userId,
        }),
      );

      return new Response<unknown>({
        code: 201,
        success: true,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('downvote/:id')
  async removeDownvote(@Param('id') id: string, @Req() req) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.downvote.remove', {
          commentId: id,
          userId: req.auth?.userId,
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

  @Post()
  async createComment(@Req() req, @Body() createCommentDto: CreateCommentDto) {
    try {
      if (createCommentDto.parent_id) createCommentDto.is_root = false;
      else delete createCommentDto.is_root;

      const comment = await firstValueFrom<Comment>(
        this.postsClient.send('comment.create', {
          createCommentDto,
          userId: req.auth?.userId,
        }),
      );

      return new Response<Comment>({
        code: 201,
        success: true,
        data: comment,
        message: 'Created',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findComment(@Param('id') commentId: string) {
    try {
      const data = await firstValueFrom<Comment>(
        this.postsClient.send('comment.find_by_id', commentId),
      );

      return new Response<Comment>({
        code: 200,
        success: true,
        data,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async removeComment(@Req() req, @Param('id') id: string) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.remove', {
          commentId: id,
          userId: req.auth?.userId,
        }),
      );

      return new Response<unknown>({
        code: 200,
        success: true,
        message: 'Deleted',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  async updateComment(
    @Req() req,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    try {
      const comment = await firstValueFrom<Comment>(
        this.postsClient.send('comment.update', {
          commentId: id,
          userId: req.auth?.userId,
          updateCommentDto,
        }),
      );

      return new Response<Comment>({
        code: 200,
        success: true,
        data: comment,
        message: 'Updated',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
