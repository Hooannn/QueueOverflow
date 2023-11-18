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
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateCommentDto,
  QueryDto,
  UpdateCommentDto,
} from '@queueoverflow/shared/dtos';
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

  @Post('upvote/:commentId/post/:postId')
  async upvote(
    @Param('commentId') commentId: string,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.upvote.create', {
          commentId,
          postId,
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

  @Delete('upvote/:commentId/post/:postId')
  async removeUpvote(
    @Param('commentId') commentId: string,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.upvote.remove', {
          commentId,
          postId,
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

  @Post('downvote/:commentId/post/:postId')
  async downvote(
    @Param('commentId') commentId: string,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.downvote.create', {
          commentId,
          postId,
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

  @Delete('downvote/:commentId/post/:postId')
  async removeDownvote(
    @Param('commentId') commentId: string,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    try {
      await firstValueFrom<unknown>(
        this.postsClient.send('comment.downvote.remove', {
          commentId,
          postId,
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

  @Get('my_own')
  async findMyOwn(
    @Req() req,
    @Query() queryDto: QueryDto,
    @Query('relations', new ParseArrayPipe({ optional: true }))
    relations?: string[],
  ) {
    try {
      const { data, total } = await firstValueFrom<{
        data: Comment[];
        total?: number;
      }>(
        this.postsClient.send('comment.find_all_by_uid', {
          queryDto: { ...queryDto, relations },
          userId: req.auth?.userId,
        }),
      );

      return new Response<Comment[]>({
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

  @Get('user/:userId')
  async findUserComments(
    @Param('userId') userId: string,
    @Query() queryDto: QueryDto,
    @Query('relations', new ParseArrayPipe({ optional: true }))
    relations?: string[],
  ) {
    try {
      const { data, total } = await firstValueFrom<{
        data: Comment[];
        total?: number;
      }>(
        this.postsClient.send('comment.find_all_by_uid', {
          queryDto: { ...queryDto, relations },
          userId,
        }),
      );

      return new Response<Comment[]>({
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
