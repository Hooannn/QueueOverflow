import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { Post } from '@queueoverflow/shared/entities';
import {
  CreatePostDto,
  QueryDto,
  QueryPostDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
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
      relations: query.relations ?? [],
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
}
