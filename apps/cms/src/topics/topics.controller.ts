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
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.find_all')
  async findAll(@Payload() query: QueryDto) {
    try {
      const { data, total } = await this.topicsService.findAll(query);

      return { data, total };
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.find_by_id')
  async findOne(@Payload() id: string) {
    try {
      const topic = await this.topicsService.findOne(id);
      return topic;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.update')
  async update(
    @Payload()
    params: {
      topicId: string;
      updateTopicDto: UpdateTopicDto;
      updatedBy: string;
    },
  ) {
    try {
      const updatedRecord = await this.topicsService.update(
        params.topicId,
        params.updateTopicDto,
        params.updatedBy,
      );

      return updatedRecord;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('topic.remove')
  async remove(@Payload() params: { id: string; removedBy: string }) {
    try {
      await this.topicsService.remove(params.id, params.removedBy);
      return params.id;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
