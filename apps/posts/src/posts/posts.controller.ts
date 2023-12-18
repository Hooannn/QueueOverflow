import { Controller, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  EventPattern,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import {
  CreatePostDto,
  QueryDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';
import { PinoLogger } from 'nestjs-pino';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly logger: PinoLogger,
  ) {}

  @MessagePattern('post.create')
  async create(
    @Payload() params: { createPostDto: CreatePostDto; createdBy?: string },
  ) {
    try {
      delete params.createPostDto.publish;
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

  @MessagePattern('post.find_related')
  async findRelated(@Payload() postId: string) {
    try {
      const data = await this.postsService.findRelated(postId);

      return data;
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

  @MessagePattern('post.find_upvoted')
  async findUpvotedPosts(
    @Payload() params: { query: QueryDto; userId: string },
  ) {
    try {
      const { data, total } = await this.postsService.findUpvotedPosts(
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

  @MessagePattern('post.find_reviewing')
  async findReviewingPosts(
    @Payload() params: { query: QueryDto; userId: string },
  ) {
    try {
      const { data, total } = await this.postsService.findReviewingPosts(
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

  @MessagePattern('post.find_downvoted')
  async findDownvotedPosts(
    @Payload() @Payload() params: { query: QueryDto; userId: string },
  ) {
    try {
      const { data, total } = await this.postsService.findDownvotedPosts(
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

  @MessagePattern('post.find_all_by_uid')
  async findAllByUid(
    @Payload() params: { queryDto: QueryDto; userId: string },
  ) {
    try {
      const { data, total } = await this.postsService.findAllByUid(
        params.queryDto,
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

  @MessagePattern('post.find_published_by_id')
  async findPublishedOne(@Payload() id: string) {
    try {
      const post = await this.postsService.findPublishedOne(id);
      return post;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('post.find_reviewing_by_id')
  async findReviewingOne(
    @Payload() params: { userId: string; postId: string },
  ) {
    try {
      const post = await this.postsService.findReviewingOne(params);
      return post;
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
      delete params.updatePostDto.publish;
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

  @MessagePattern('post.count_by_topic')
  async countByTopic(
    @Payload()
    topicId: string,
  ) {
    try {
      return await this.postsService.countByTopic(topicId);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @EventPattern('post.reviewed')
  async onPostReviewed(
    @Payload()
    params: {
      postId: string;
      success: boolean;
      message: string;
    },
  ) {
    try {
      this.postsService.onPostReviewed(
        params.postId,
        params.success,
        params.message,
      );
    } catch (error) {
      this.logger.error(
        error.message || 'Error on onPostReviewed ' + JSON.stringify(params),
      );
    }
  }

  @EventPattern('post.updated.reviewed')
  async onUpdatedPostReviewed(
    @Payload()
    params: {
      postId: string;
      success: boolean;
      message: string;
    },
  ) {
    try {
      this.postsService.onUpdatedPostReviewed(
        params.postId,
        params.success,
        params.message,
      );
    } catch (error) {
      this.logger.error(
        error.message ||
          'Error on onUpdatedPostReviewed ' + JSON.stringify(params),
      );
    }
  }
}
