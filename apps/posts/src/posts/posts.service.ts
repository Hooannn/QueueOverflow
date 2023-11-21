import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindManyOptions,
  FindOptionsWhere,
  DataSource,
} from 'typeorm';
import { Post, VoteType, PostVote, User } from '@queueoverflow/shared/entities';
import {
  CreatePostDto,
  QueryDto,
  QueryPostDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class PostsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostVote)
    private readonly votesRepository: Repository<PostVote>,
    @Inject('SEARCH_SERVICE')
    private readonly searchClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  private userFindOptionsSelect: FindOptionsSelect<User> = {
    first_name: true,
    last_name: true,
    avatar: true,
    id: true,
    created_at: true,
  };

  private voteFindOptionsSelect: FindOptionsSelect<PostVote> = {
    uid: true,
    type: true,
  };

  private findOptionsSelect: FindOptionsSelect<Post> = {
    creator: this.userFindOptionsSelect,
    topics: {
      id: true,
      title: true,
      description: true,
    },
    votes: this.voteFindOptionsSelect,
    comments: {
      id: true,
      idx: true,
      created_at: true,
      created_by: true,
      updated_at: true,
      content: true,
      is_root: true,
      parent_id: true,
      meta_data: true,
      post_id: true,
      creator: this.userFindOptionsSelect,
      votes: this.voteFindOptionsSelect,
    },
  };

  async create(createPostDto: CreatePostDto, createdBy?: string) {
    const post = this.postsRepository.create({
      ...createPostDto,
      created_by: createdBy,
    });
    const res = await this.postsRepository.save(post);
    this.searchClient.emit('post.created', [res]);
    this.notificationsClient.emit('post.created', post.id);
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

  async findAllByUid(query: QueryPostDto, userId: string) {
    const findOptions: FindManyOptions<Post> = {
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
    const countOptions: FindManyOptions<Post> = {
      where: { created_by: userId },
      select: { id: true },
    };
    if (query.topicIds?.length) {
      const where: FindOptionsWhere<Post>[] = query.topicIds.map((topicId) => ({
        topics: { id: topicId },
      }));
      where.push({ created_by: userId });
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
        comments: {
          creator: true,
          votes: true,
        },
      },
    });

    res.comments = res.comments
      .sort(function (a, b) {
        return (
          (new Date(b.created_at) as any) - (new Date(a.created_at) as any)
        );
      })
      .reverse();
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
    const updatedRecord = await this.findOne(id);
    this.searchClient.emit('post.updated', updatedRecord);
    return updatedRecord;
  }

  async remove(id: string, removedBy?: string) {
    const res = await this.postsRepository.delete({
      id,
      created_by: removedBy,
    });

    if (res.affected == 0) {
      throw new RpcException({
        message: 'Invalid request',
        status: HttpStatus.CONFLICT,
      });
    }

    this.searchClient.emit('post.removed', id);
    return res;
  }

  async findUpvotedPosts(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<PostVote> = {
      skip: query.offset,
      take: query.limit,
      where: {
        uid: userId,
        type: VoteType.Up,
      },
      select: {
        post: {
          ...this.findOptionsSelect,
          title: true,
          id: true,
          tags: true,
          type: true,
          content: true,
          publish: true,
          updated_at: true,
          created_at: true,
          created_by: true,
        },
      },
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<PostVote> = {
      select: { post_id: true },
      where: { uid: userId },
    };

    const [data, total] = await Promise.all([
      this.votesRepository.find(findOptions),
      this.votesRepository.count(countOptions),
    ]);

    return { data, total };
  }

  async findDownvotedPosts(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<PostVote> = {
      skip: query.offset,
      take: query.limit,
      where: {
        uid: userId,
        type: VoteType.Down,
      },
      select: {
        post: {
          ...this.findOptionsSelect,
          title: true,
          id: true,
          tags: true,
          type: true,
          content: true,
          publish: true,
          updated_at: true,
          created_at: true,
          created_by: true,
        },
      },
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<PostVote> = {
      select: { post_id: true },
      where: { uid: userId },
    };

    const [data, total] = await Promise.all([
      this.votesRepository.find(findOptions),
      this.votesRepository.count(countOptions),
    ]);

    return { data, total };
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

  async countByTopic(topicId: string) {
    const repo = 'posts_topics';
    return await this.dataSource
      .getRepository(repo)
      .createQueryBuilder(repo)
      .select('topic_id')
      .where('topic_id = :topicId', { topicId })
      .getCount();
  }
}
