import { Controller, HttpStatus } from '@nestjs/common';
import { UserHistoriesService } from './user_histories.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { QueryDto } from '@queueoverflow/shared/dtos';

@Controller()
export class UserHistoriesController {
  constructor(private readonly userHistoriesService: UserHistoriesService) {}

  @MessagePattern('user_history.create')
  async create(@Payload() params: { userId: string; postId: string }) {
    try {
      const res = await this.userHistoriesService.create(
        params.userId,
        params.postId,
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

  @MessagePattern('user_history.find_all')
  async findAll(@Payload() params: { userId: string; query: QueryDto }) {
    try {
      const { data, total } = await this.userHistoriesService.findAll(
        params.query,
        params.userId,
      );

      return { data, total };
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
