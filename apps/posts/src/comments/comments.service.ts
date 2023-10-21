import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto, UpdateCommentDto } from '@queueoverflow/shared/dtos';
import { CommentVote, Comment, VoteType } from '@queueoverflow/shared/entities';
import { FindOptionsSelect, Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(CommentVote)
    private readonly votesRepository: Repository<CommentVote>,
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

    return await this.commentsRepository.save(comment);
  }

  async remove(commentId: string, userId: string) {
    return await this.commentsRepository.delete({
      created_by: userId,
      id: commentId,
    });
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

    return await this.commentsRepository.findOne({ where: { id: commentId } });
  }

  async upvote(commentId: string, userId: string) {
    const existingVote = await this.votesRepository.findOne({
      where: { uid: userId, comment_id: commentId, type: VoteType.Up },
    });

    if (existingVote) return await this.removeUpvote(commentId, userId);

    const newVote = this.votesRepository.create({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Up,
    });
    return await this.votesRepository.save(newVote);
  }

  async removeUpvote(commentId: string, userId: string) {
    return await this.votesRepository.delete({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Up,
    });
  }

  async downvote(commentId: string, userId: string) {
    const existingVote = await this.votesRepository.findOne({
      where: { uid: userId, comment_id: commentId, type: VoteType.Down },
    });

    if (existingVote) return await this.removeDownvote(commentId, userId);

    const newVote = this.votesRepository.create({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Down,
    });
    return await this.votesRepository.save(newVote);
  }

  async removeDownvote(commentId: string, userId: string) {
    return await this.votesRepository.delete({
      uid: userId,
      comment_id: commentId,
      type: VoteType.Down,
    });
  }
}
