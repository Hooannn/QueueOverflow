import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { Subscription } from '@queueoverflow/shared/entities';
import { RpcException } from '@nestjs/microservices';
import { QueryDto } from '@queueoverflow/shared/dtos';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
  ) {}

  private findOptionsSelect: FindOptionsSelect<Subscription> = {};

  async subscribeTopic(userId: string, topicId: string) {
    const isExisted = await this.subscriptionsRepository.findOne({
      where: {
        uid: userId,
        topic_id: topicId,
      },
    });

    if (isExisted)
      throw new RpcException({
        message: 'Bad request',
        status: HttpStatus.CONFLICT,
      });

    const post = this.subscriptionsRepository.create({
      uid: userId,
      topic_id: topicId,
    });
    const res = await this.subscriptionsRepository.save(post);
    return res;
  }

  async findAllSubcriptionsByUser(userId: string, queryDto: QueryDto) {
    const [data, total] = await Promise.all([
      this.subscriptionsRepository.find({
        select: this.findOptionsSelect,
        skip: queryDto?.offset,
        take: queryDto?.limit,
        relations: (queryDto as any)?.relations ?? [],
        order: {
          updated_at: -1,
        },
        where: {
          uid: userId,
        },
      }),

      this.subscriptionsRepository.count({
        select: { uid: true },
        where: {
          uid: userId,
        },
      }),
    ]);

    return {
      data,
      total,
    };
  }

  async findAllSubcriptionsByTopic(topicId: string, queryDto: QueryDto) {
    const [data, total] = await Promise.all([
      this.subscriptionsRepository.find({
        select: this.findOptionsSelect,
        skip: queryDto?.offset,
        take: queryDto?.limit,
        relations: (queryDto as any)?.relations ?? [],
        order: {
          updated_at: -1,
        },
        where: {
          topic_id: topicId,
        },
      }),

      this.subscriptionsRepository.count({
        select: { uid: true },
        where: {
          topic_id: topicId,
        },
      }),
    ]);

    return {
      data,
      total,
    };
  }
}
