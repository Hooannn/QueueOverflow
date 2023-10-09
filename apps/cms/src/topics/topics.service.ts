import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateTopicDto,
  QueryDto,
  UpdateTopicDto,
} from '@queueoverflow/shared/dtos';
import { Topic } from '@queueoverflow/shared/entities';
import { Repository, FindOptionsSelect } from 'typeorm';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
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

  async findAll(query: QueryDto) {
    const [data, total] = await Promise.all([
      this.topicsRepository.find({
        select: this.findOptionsSelect,
        skip: query.offset,
        take: query.limit,
        relations: query.relations ?? [],
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
    const res = await this.topicsRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        id,
      },
    });
    return res;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto, updatedBy?: string) {
    await this.topicsRepository.update(id, updateTopicDto);

    return await this.findOne(id);
  }

  async remove(id: string) {
    const res = await this.topicsRepository.delete(id);
    return res;
  }
}
