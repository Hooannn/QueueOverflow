import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateTopicDto,
  QueryDto,
  UpdateTopicDto,
} from '@queueoverflow/shared/dtos';
import { Topic } from '@queueoverflow/shared/entities';
import { firstValueFrom } from 'rxjs';
import { Repository, FindOptionsSelect } from 'typeorm';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,

    @Inject('POSTS_SERVICE') private readonly postsClient: ClientProxy,
  ) {}

  private findOptionsSelect: FindOptionsSelect<Topic> = {
    creator: {
      first_name: true,
      last_name: true,
      avatar: true,
      id: true,
    },
  };

  async create(createTopicDto: CreateTopicDto, createdBy?: string) {
    const topic = this.topicsRepository.create({
      ...createTopicDto,
      created_by: createdBy,
    });
    const res = await this.topicsRepository.save(topic);
    return res;
  }

  async createMany(createTopicsDto: CreateTopicDto[], createdBy?: string) {
    const topics = this.topicsRepository.create(
      createTopicsDto.map((dto) => ({ ...dto, created_by: createdBy })),
    );
    const res = await this.topicsRepository.save(topics);
    return res;
  }

  async findAll(query: QueryDto) {
    const [data, total] = await Promise.all([
      this.topicsRepository.find({
        select: this.findOptionsSelect,
        skip: query?.offset,
        take: query?.limit,
        relations: (query as any)?.relations ?? [],
        order: {
          updated_at: -1,
        },
      }),

      this.topicsRepository.count({ select: { id: true } }),
    ]);

    return {
      data,
      total,
    };
  }

  async findOne(id: string) {
    const [topic, postsCount, subscriptionsCount] = await Promise.all([
      this.topicsRepository.findOne({
        select: this.findOptionsSelect,
        where: {
          id,
        },
      }),
      firstValueFrom<number>(this.postsClient.send('post.count_by_topic', id)),
      firstValueFrom<number>(
        this.postsClient.send('subscription.count_by_topic', id),
      ),
    ]);

    return {
      ...topic,
      posts_count: postsCount,
      subscriptions_count: subscriptionsCount,
    };
  }

  async update(id: string, updateTopicDto: UpdateTopicDto, updatedBy?: string) {
    await this.topicsRepository.update(
      { id, created_by: updatedBy },
      updateTopicDto,
    );

    return await this.findOne(id);
  }

  async remove(id: string, removedBy?: string) {
    const res = await this.topicsRepository.delete({
      id,
      created_by: removedBy,
    });
    return res;
  }
}
