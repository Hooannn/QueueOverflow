import { Controller, HttpStatus } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  CreateTopicDto,
  UpdateTopicDto,
  QueryDto,
} from '@queueoverflow/shared/dtos';
@Controller()
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @MessagePattern('topic.create')
  async create(
    @Payload() params: { createTopicDto: CreateTopicDto; createdBy?: string },
  ) {
    try {
      const topic = await this.topicsService.create(
        params.createTopicDto,
        params.createdBy,
      );

      return topic;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.find_all')
  async findAll(@Payload() query: QueryDto) {
    try {
      const { data, total } = await this.topicsService.findAll(query);

      return { data, total };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.find_by_id')
  async findOne(@Payload() id: string) {
    try {
      const topic = await this.topicsService.findOne(id);
      return topic;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.update')
  async update(
    @Payload()
    params: {
      userId: string;
      updateTopicDto: UpdateTopicDto;
      updatedBy: string;
    },
  ) {
    try {
      const updatedRecord = await this.topicsService.update(
        params.userId,
        params.updateTopicDto,
        params.updatedBy,
      );

      return updatedRecord;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.remove')
  async remove(@Payload() id: string) {
    try {
      await this.topicsService.remove(id);
      return id;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Invalid request',
        status: error.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
