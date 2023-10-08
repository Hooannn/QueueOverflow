import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsSelect } from 'typeorm';
import { Post } from '@queueoverflow/shared/entities';
import {
  CreatePostDto,
  QueryDto,
  UpdatePostDto,
} from '@queueoverflow/shared/dtos';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  private findOptionsSelect: FindOptionsSelect<Post> = {};

  async create(createPostDto: CreatePostDto, createdBy?: string) {
    const post = this.postsRepository.create(createPostDto);
    const res = await this.postsRepository.save(post);
    return res;
  }

  async findAll(query: QueryDto) {
    const [data, total] = await Promise.all([
      this.postsRepository.find({
        select: this.findOptionsSelect,
        skip: query.offset,
        take: query.limit,
      }),

      this.postsRepository.count({ select: { id: true } }),
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
    await this.postsRepository.update(id, updatePostDto);

    return await this.findOne(id);
  }

  async remove(id: string, removedBy?: string) {
    const res = await this.postsRepository.delete(id);
    return res;
  }
}
