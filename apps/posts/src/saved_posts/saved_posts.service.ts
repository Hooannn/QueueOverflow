import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDto } from '@queueoverflow/shared/dtos';
import {
  Post,
  PostVote,
  SavedPost,
  User,
} from '@queueoverflow/shared/entities';
import { FindManyOptions, FindOptionsSelect, Repository } from 'typeorm';

@Injectable()
export class SavedPostsService {
  constructor(
    @InjectRepository(SavedPost)
    private readonly savedPostsRepository: Repository<SavedPost>,
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

  private findOptionsSelect: FindOptionsSelect<SavedPost> = {
    post: this.postfindOptionsSelect,
  };

  async create(userId: string, postId: string) {
    const post = this.savedPostsRepository.create({
      uid: userId,
      post_id: postId,
    });
    return await this.savedPostsRepository.save(post);
  }

  async remove(userId: string, postId: string) {
    return await this.savedPostsRepository.delete({
      uid: userId,
      post_id: postId,
    });
  }

  async findAll(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<SavedPost> = {
      skip: query.offset,
      take: query.limit,
      where: {
        uid: userId,
      },
      select: this.findOptionsSelect,
      relations: (query as any).relations ?? [],
      order: {
        updated_at: -1,
      },
    };
    const countOptions: FindManyOptions<SavedPost> = {
      select: { post_id: true },
      where: { uid: userId },
    };

    const [data, total] = await Promise.all([
      this.savedPostsRepository.find(findOptions),
      this.savedPostsRepository.count(countOptions),
    ]);

    return { data, total };
  }

  async findAllIds(userId: string) {
    return await this.savedPostsRepository.find({
      where: { uid: userId },
      select: { post_id: true },
    });
  }
}
