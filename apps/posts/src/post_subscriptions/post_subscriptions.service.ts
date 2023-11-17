import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDto } from '@queueoverflow/shared/dtos';
import { PostSubscription } from '@queueoverflow/shared/entities';
import { Repository, FindManyOptions } from 'typeorm';

@Injectable()
export class PostSubscriptionsService {
  constructor(
    @InjectRepository(PostSubscription)
    private readonly postSubscriptionsRepository: Repository<PostSubscription>,
  ) {}

  async create(userId: string, postId: string) {
    const sub = this.postSubscriptionsRepository.create({
      uid: userId,
      post_id: postId,
    });
    return await this.postSubscriptionsRepository.save(sub);
  }

  async remove(userId: string, postId: string) {
    return await this.postSubscriptionsRepository.delete({
      uid: userId,
      post_id: postId,
    });
  }

  async findByPostId(postId: string) {
    return await this.postSubscriptionsRepository.find({
      where: {
        post_id: postId,
      },
    });
  }

  async findAll(query: QueryDto, userId: string) {
    const findOptions: FindManyOptions<PostSubscription> = {
      where: {
        uid: userId,
      },
      select: {
        uid: true,
        post_id: true,
      },
    };
    const countOptions: FindManyOptions<PostSubscription> = {
      select: { post_id: true },
      where: { uid: userId },
    };

    const [data, total] = await Promise.all([
      this.postSubscriptionsRepository.find(findOptions),
      this.postSubscriptionsRepository.count(countOptions),
    ]);

    return { data, total };
  }
}
