import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDto } from '@queueoverflow/shared/dtos';
import {
  Post,
  PostVote,
  User,
  UserHistory,
} from '@queueoverflow/shared/entities';
import { FindManyOptions, FindOptionsSelect, Repository } from 'typeorm';

@Injectable()
export class UserHistoriesService {
  constructor(
    @InjectRepository(UserHistory)
    private readonly savedPostsRepository: Repository<UserHistory>,
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

  private postfindOptionsSelect: FindOptionsSelect<Post> = {
    title: true,
    id: true,
    tags: true,
    type: true,
    content: true,
    publish: true,
    updated_at: true,
    created_at: true,
    created_by: true,
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

  private findOptionsSelect: FindOptionsSelect<UserHistory> = {
    post: this.postfindOptionsSelect,
  };

  async create(userId: string, postId: string) {
    const entity = this.savedPostsRepository.create({
      uid: userId,
      post_id: postId,
      updated_at: new Date(),
    });
    return await this.savedPostsRepository.save(entity);
  }

  async findAll(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<UserHistory> = {
      skip: query.offset,
      take: query.limit,
      where: {
        uid: userId,
      },
      relations: (query as any).relations ?? [],
      select: this.findOptionsSelect,
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<UserHistory> = {
      select: { post_id: true },
      where: { uid: userId },
    };

    const [data, total] = await Promise.all([
      this.savedPostsRepository.find(findOptions),
      this.savedPostsRepository.count(countOptions),
    ]);

    return { data, total };
  }
}
