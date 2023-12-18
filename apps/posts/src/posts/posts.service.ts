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
import { HttpService } from '@nestjs/axios';
import config from 'src/configs';

@Injectable()
export class PostsService {
  constructor(
    private readonly httpService: HttpService,
    private dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostVote)
    private readonly votesRepository: Repository<PostVote>,
    @Inject('SEARCH_SERVICE')
    private readonly searchClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
    @Inject('REVIEW_SERVICE')
    private readonly reviewClient: ClientProxy,
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
    this.reviewClient.emit('post.created', res);
    this.searchClient.emit('post.created', [res]);
    return res;
  }

  async update_(id: string, updatePostDto: UpdatePostDto) {
    await this.postsRepository.update(
      {
        id,
      },
      updatePostDto,
    );
    const updatedRecord = await this.findOne(id);
    this.searchClient.emit('post.updated', updatedRecord);
    return updatedRecord;
  }

  async update(id: string, updatePostDto: UpdatePostDto, updatedBy?: string) {
    const existingRecord = await this.postsRepository.findOne({
      where: { id, created_by: updatedBy },
    });

    if (!existingRecord) {
      throw new RpcException({
        message: 'Forbidden request',
        status: HttpStatus.FORBIDDEN,
      });
    }

    existingRecord.topics = updatePostDto.topics as any;
    existingRecord.title = updatePostDto.title;
    existingRecord.content = updatePostDto.content;
    existingRecord.type = updatePostDto.type;
    existingRecord.tags = updatePostDto.tags;
    existingRecord.meta_data = updatePostDto.meta_data;
    await this.postsRepository.save(existingRecord);
    const updatedRecord = await this.findOne(id);

    this.searchClient.emit('post.updated', updatedRecord);
    this.reviewClient.emit('post.updated', updatedRecord);
    return updatedRecord;
  }

  async onUpdatedPostReviewed(
    postId: string,
    success: boolean,
    message: string,
  ) {
    try {
      await this.update_(postId, { publish: success });
      if (!success)
        this.notificationsClient.emit('post.reviewed', {
          postId,
          success,
          message,
        });
    } catch (error) {
      await this.update_(postId, { publish: false });
    }
  }

  async onPostReviewed(postId: string, success: boolean, message: string) {
    try {
      await this.update_(postId, { publish: success });
      if (success) this.notificationsClient.emit('post.created', postId);
      this.notificationsClient.emit('post.reviewed', {
        postId,
        success,
        message,
      });
    } catch (error) {
      await this.update_(postId, { publish: false });
    }
  }

  async findRelated(postId: string) {
    const res = await this.httpService.axiosRef.get<
      { id: string; score: number }[]
    >(`${config.RECOMMENDATIONS_HOST}/posts/${postId}/related`);
    if (!res.data.length) return [];
    let posts = await this.postsRepository.find({
      where: res.data.map((r) => ({ id: r.id, publish: true })),
      relations: {
        votes: true,
      },
    });
    posts = posts.map((p) => ({
      ...p,
      score: res.data.find((r) => r.id === p.id).score,
    }));
    return posts.reverse();
  }

  async findAll(query: QueryPostDto) {
    const findOptions: FindManyOptions<Post> = {
      where: {
        publish: true,
      },
      select: this.findOptionsSelect,
      skip: query.offset,
      take: query.limit,
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<Post> = {
      where: {
        publish: true,
      },
      select: { id: true },
    };
    if (query.topicIds?.length) {
      const where: FindOptionsWhere<Post>[] = query.topicIds.map((topicId) => ({
        topics: { id: topicId },
      }));
      where.push({ publish: true });
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
        publish: true,
      },
      skip: query.offset,
      take: query.limit,
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<Post> = {
      where: { created_by: userId, publish: true },
      select: { id: true },
    };
    if (query.topicIds?.length) {
      const where: FindOptionsWhere<Post>[] = query.topicIds.map((topicId) => ({
        topics: { id: topicId },
      }));
      where.push({ created_by: userId, publish: true });
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

  async findPublishedOne(id: string) {
    const res = await this.postsRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        id,
        publish: true,
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

  async findReviewingOne(params: { userId: string; postId: string }) {
    const res = await this.postsRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        id: params.postId,
        created_by: params.userId,
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

  async findReviewingPosts(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<Post> = {
      select: this.findOptionsSelect,
      where: {
        created_by: userId,
        publish: false,
      },
      skip: query.offset,
      take: query.limit,
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<Post> = {
      where: { created_by: userId, publish: false },
      select: { id: true },
    };

    const [data, total] = await Promise.all([
      this.postsRepository.find(findOptions),
      this.postsRepository.count(countOptions),
    ]);

    return {
      data,
      total,
    };
  }

  async findUpvotedPosts(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<PostVote> = {
      skip: query.offset,
      take: query.limit,
      where: {
        uid: userId,
        type: VoteType.Up,
        post: {
          publish: true,
        },
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
      where: {
        uid: userId,
        type: VoteType.Up,
        post: {
          publish: true,
        },
      },
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
        post: {
          publish: true,
        },
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
      where: {
        uid: userId,
        type: VoteType.Down,
        post: {
          publish: true,
        },
      },
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
