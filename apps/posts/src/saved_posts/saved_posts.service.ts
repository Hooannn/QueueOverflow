import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDto } from '@queueoverflow/shared/dtos';
import { SavedPost } from '@queueoverflow/shared/entities';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class SavedPostsService {
  constructor(
    @InjectRepository(SavedPost)
    private readonly savedPostsRepository: Repository<SavedPost>,
  ) {}

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
      relations: {
        post: true,
      },
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
