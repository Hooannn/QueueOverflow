import { Controller, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateCommentDto, UpdateCommentDto } from '@queueoverflow/shared/dtos';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern('comment.find_by_id')
  async findOne(
    @Payload()
    commentId: string,
  ) {
    try {
      return await this.commentsService.findOne(commentId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('comment.create')
  async create(
    @Payload()
    params: {
      createCommentDto: CreateCommentDto;
      userId: string;
    },
  ) {
    try {
      return await this.commentsService.create(
        params.createCommentDto,
        params.userId,
      );
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('comment.remove')
  async remove(
    @Payload()
    params: {
      commentId: string;
      userId: string;
    },
  ) {
    try {
      return await this.commentsService.remove(params.commentId, params.userId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('comment.update')
  async update(
    @Payload()
    params: {
      commentId: string;
      userId: string;
      updateCommentDto: UpdateCommentDto;
    },
  ) {
    try {
      return await this.commentsService.update(
        params.commentId,
        params.updateCommentDto,
        params.userId,
      );
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('comment.upvote.create')
  async upvote(
    @Payload()
    params: {
      commentId: string;
      userId: string;
    },
  ) {
    try {
      return await this.commentsService.upvote(params.commentId, params.userId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('comment.upvote.remove')
  async removeUpvote(
    @Payload()
    params: {
      commentId: string;
      userId: string;
    },
  ) {
    try {
      return await this.commentsService.removeUpvote(
        params.commentId,
        params.userId,
      );
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('comment.downvote.create')
  async downvote(
    @Payload()
    params: {
      commentId: string;
      userId: string;
    },
  ) {
    try {
      return await this.commentsService.downvote(
        params.commentId,
        params.userId,
      );
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('comment.downvote.remove')
  async removeDownvote(
    @Payload()
    params: {
      commentId: string;
      userId: string;
    },
  ) {
    try {
      return await this.commentsService.removeDownvote(
        params.commentId,
        params.userId,
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
