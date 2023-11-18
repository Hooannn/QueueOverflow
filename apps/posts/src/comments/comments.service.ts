import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateCommentDto,
  QueryDto,
  UpdateCommentDto,
} from '@queueoverflow/shared/dtos';
import { CommentVote, Comment, VoteType } from '@queueoverflow/shared/entities';
import { FindManyOptions, FindOptionsSelect, Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(CommentVote)
    private readonly votesRepository: Repository<CommentVote>,

    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  private findOptionsSelect: FindOptionsSelect<Comment> = {
    creator: {
      first_name: true,
      last_name: true,
      avatar: true,
      id: true,
    },
    votes: {
      uid: true,
      type: true,
    },
  };

  async findAllByUid(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<Comment> = {
      select: this.findOptionsSelect,
      where: {
        created_by: userId,
      },
      skip: query.offset,
      take: query.limit,
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<Comment> = {
      where: { created_by: userId },
      select: { id: true },
    };

    const [data, total] = await Promise.all([
      this.commentsRepository.find(findOptions),
      this.commentsRepository.count(countOptions),
    ]);

    return {
      data,
      total,
    };
  }

  async findOne(commentId: string) {
    return await this.commentsRepository.findOne({
      select: this.findOptionsSelect,
      where: { id: commentId },
      relations: {
        creator: true,
        votes: true,
        parent: true,
      },
    });
  }

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      created_by: userId,
    });

    const savedComment = await this.commentsRepository.save(comment);

    this.notificationsClient.emit('comment.created', {
      postId: savedComment.post_id,
      commentId: savedComment.id,
    });

    return savedComment;
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new RpcException({
        message: 'Invalid request',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const res = await this.commentsRepository.delete({
      created_by: userId,
      id: commentId,
    });

    this.notificationsClient.emit('comment.removed', {
      postId: comment.post_id,
      commentId: comment.id,
      userId,
    });
    return res;
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ) {
    await this.commentsRepository.update(
      { id: commentId, created_by: userId },
      updateCommentDto,
    );
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    this.notificationsClient.emit('comment.updated', {
      postId: comment.post_id,
      commentId: comment.id,
      userId,
    });
    return comment;
  }

  async upvote(commentId: string, postId: string, userId: string) {
    const existingVote = await this.votesRepository.findOne({
      where: { uid: userId, comment_id: commentId, type: VoteType.Up },
    });

    if (existingVote) return await this.removeUpvote(commentId, postId, userId);

    const newVote = this.votesRepository.create({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Up,
    });

    const savedVote = await this.votesRepository.save(newVote);
    this.notificationsClient.emit('comment.updated', {
      postId: postId,
      commentId: commentId,
      userId,
    });
    return savedVote;
  }

  async removeUpvote(commentId: string, postId: string, userId: string) {
    const res = await this.votesRepository.delete({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Up,
    });
    this.notificationsClient.emit('comment.updated', {
      postId: postId,
      commentId: commentId,
      userId,
    });
    return res;
  }

  async downvote(commentId: string, postId: string, userId: string) {
    const existingVote = await this.votesRepository.findOne({
      where: { uid: userId, comment_id: commentId, type: VoteType.Down },
    });

    if (existingVote)
      return await this.removeDownvote(commentId, postId, userId);

    const newVote = this.votesRepository.create({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Down,
    });

    const savedVote = await this.votesRepository.save(newVote);
    this.notificationsClient.emit('comment.updated', {
      postId: postId,
      commentId: commentId,
      userId,
    });
    return savedVote;
  }

  async removeDownvote(commentId: string, postId: string, userId: string) {
    const res = await this.votesRepository.delete({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Down,
    });
    this.notificationsClient.emit('comment.updated', {
      postId: postId,
      commentId: commentId,
      userId,
    });
    return res;
  }
}
