import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { SubscriptionsService } from './subcriptions.service';
import { QueryDto } from '@queueoverflow/shared/dtos';

@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @MessagePattern('subscription.topic.create')
  async subscribeTopic(
    @Payload()
    params: {
      userId: string;
      topicId: string;
    },
  ) {
    try {
      const res = await this.subscriptionsService.subscribeTopic(
        params.userId,
        params.topicId,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('subscription.topic.remove')
  async unsubscribeTopic(
    @Payload()
    params: {
      userId: string;
      topicId: string;
    },
  ) {
    try {
      const res = await this.subscriptionsService.unsubscribeTopic(
        params.userId,
        params.topicId,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('subscription.find_by_user')
  async findAllSubcriptionsByUser(
    @Payload()
    params: {
      userId: string;
      queryDto: QueryDto;
    },
  ) {
    try {
      const res = await this.subscriptionsService.findAllSubcriptionsByUser(
        params.userId,
        params.queryDto,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('subscription.find_by_topic')
  async findAllSubcriptionsByTopic(
    @Payload()
    params: {
      topicId: string;
      queryDto: QueryDto;
    },
  ) {
    try {
      const res = await this.subscriptionsService.findAllSubcriptionsByTopic(
        params.topicId,
        params.queryDto,
      );

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('subscription.count_by_topic')
  async countByTopic(
    @Payload()
    topicId: string,
  ) {
    try {
      const res = await this.subscriptionsService.countByTopic(topicId);

      return res;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
