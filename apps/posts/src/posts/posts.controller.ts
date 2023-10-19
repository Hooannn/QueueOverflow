import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  ClientProxy,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import {
  CreateCommentDto,
  CreatePostDto,
  QueryDto,
  UpdateCommentDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  @MessagePattern('post.create')
  async create(
    @Payload() params: { createPostDto: CreatePostDto; createdBy?: string },
  ) {
    try {
      const post = await this.postsService.create(
        params.createPostDto,
        params.createdBy,
      );

      this.notificationsClient.emit('post.created', post.id);

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

  @MessagePattern('post.upvote.create')
  async upvote(
    @Payload()
    params: {
      postId: string;
      userId: string;
    },
  ) {
    try {
      return await this.postsService.upvote(params.postId, params.userId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.upvote.remove')
  async removeUpvote(
    @Payload()
    params: {
      postId: string;
      userId: string;
    },
  ) {
    try {
      return await this.postsService.removeUpvote(params.postId, params.userId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.downvote.create')
  async downvote(
    @Payload()
    params: {
      postId: string;
      userId: string;
    },
  ) {
    try {
      return await this.postsService.downvote(params.postId, params.userId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.downvote.remove')
  async removeDownvote(
    @Payload()
    params: {
      postId: string;
      userId: string;
    },
  ) {
    try {
      return await this.postsService.removeDownvote(
        params.postId,
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

  @MessagePattern('post.comment.create')
  async createComment(
    @Payload()
    params: {
      createCommentDto: CreateCommentDto;
      userId: string;
    },
  ) {
    try {
      const comment = await this.postsService.createComment(
        params.createCommentDto,
        params.userId,
      );

      this.notificationsClient.emit('post.comment.created', {
        postId: comment.post_id,
        commentId: comment.id,
      });

      return comment;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.comment.remove')
  async removeComment(
    @Payload()
    params: {
      commentId: string;
      userId: string;
    },
  ) {
    try {
      return await this.postsService.removeComment(
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

  @MessagePattern('post.comment.update')
  async updateComment(
    @Payload()
    params: {
      commentId: string;
      userId: string;
      updateCommentDto: UpdateCommentDto;
    },
  ) {
    try {
      return await this.postsService.updateComment(
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
}
