import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { Post, Vote, VoteType, Comment } from '@queueoverflow/shared/entities';
import {
  CreateCommentDto,
  CreatePostDto,
  QueryPostDto,
  UpdateCommentDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
  ) {}

  private findOptionsSelect: FindOptionsSelect<Post> = {
    creator: {
      first_name: true,
      last_name: true,
      avatar: true,
      id: true,
    },
    topics: {
      id: true,
      title: true,
      description: true,
    },
    votes: {
      uid: true,
      type: true,
    },
  };

  async create(createPostDto: CreatePostDto, createdBy?: string) {
    const post = this.postsRepository.create({
      ...createPostDto,
      created_by: createdBy,
    });
    const res = await this.postsRepository.save(post);
    return res;
  }

  async findAll(query: QueryPostDto) {
    const findOptions: FindManyOptions<Post> = {
      select: this.findOptionsSelect,
      skip: query.offset,
      take: query.limit,
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<Post> = {
      select: { id: true },
    };
    if (query.topicIds?.length) {
      const where: FindOptionsWhere<Post>[] = query.topicIds.map((topicId) => ({
        topics: { id: topicId },
      }));
      findOptions.where = where;
      countOptions.where = where;
    }

    const [data, total] = await Promise.all([
      this.postsRepository.find(findOptions),
      this.postsRepository.count(countOptions),
    ]);

    return {
      data,
      total,
    };
  }

  async findOne(id: string) {
    const res = await this.postsRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        id,
      },
      relations: {
        topics: true,
        creator: true,
        votes: true,
        comments: true,
      },
    });
    return res;
  }

  async update(id: string, updatePostDto: UpdatePostDto, updatedBy?: string) {
    await this.postsRepository.update(
      {
        id,
        created_by: updatedBy,
      },
      updatePostDto,
    );

    return await this.findOne(id);
  }

  async remove(id: string, removedBy?: string) {
    const res = await this.postsRepository.delete({
      id,
      created_by: removedBy,
    });
    return res;
  }

  async upvote(postId: string, userId: string) {
    const existingVote = await this.votesRepository.findOne({
      where: { uid: userId, post_id: postId, type: VoteType.Up },
    });

    if (existingVote) return await this.removeUpvote(postId, userId);

    const newVote = this.votesRepository.create({
      uid: userId,
      post_id: postId,
      type: VoteType.Up,
    });
    return await this.votesRepository.save(newVote);
  }

  async removeUpvote(postId: string, userId: string) {
    return await this.votesRepository.delete({
      uid: userId,
      post_id: postId,
      type: VoteType.Up,
    });
  }

  async downvote(postId: string, userId: string) {
    const existingVote = await this.votesRepository.findOne({
      where: { uid: userId, post_id: postId, type: VoteType.Down },
    });

    if (existingVote) return await this.removeDownvote(postId, userId);

    const newVote = this.votesRepository.create({
      uid: userId,
      post_id: postId,
      type: VoteType.Down,
    });
    return await this.votesRepository.save(newVote);
  }

  async removeDownvote(postId: string, userId: string) {
    return await this.votesRepository.delete({
      uid: userId,
      post_id: postId,
      type: VoteType.Down,
    });
  }

  async createComment(createCommentDto: CreateCommentDto, userId: string) {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      created_by: userId,
    });

    return await this.commentsRepository.save(comment);
  }

  async removeComment(commentId: string, userId: string) {
    return await this.commentsRepository.delete({
      created_by: userId,
      id: commentId,
    });
  }

  async updateComment(
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
}
