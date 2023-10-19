import { Controller, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  QueryDto,
  UpdateUserDto,
} from '@queueoverflow/shared/dtos';
import {
  MessagePattern,
  EventPattern,
  Payload,
  RmqContext,
  Ctx,
  RpcException,
} from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('user.check')
  async checkUser(@Payload() email: string) {
    try {
      const user = await this.usersService.checkUser({ email });

      return user;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.create')
  async create(
    @Payload() params: { createUserDto: CreateUserDto; createdBy?: string },
  ) {
    try {
      const user = await this.usersService.create(
        params.createUserDto,
        params.createdBy,
      );

      return user;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.find_all')
  async findAll(@Payload() query: QueryDto) {
    try {
      const { data, total } = await this.usersService.findAll(query);

      return { data, total };
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.change_password')
  async changePassword(
    @Payload() params: { userId: string; changePasswordDto: ChangePasswordDto },
  ) {
    try {
      const user = await this.usersService.changePassword(
        params.userId,
        params.changePasswordDto,
      );

      return user;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.find_by_id')
  async findOne(@Payload() id: string) {
    try {
      const user = await this.usersService.findOne(id);
      return user;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.find_password_by_email')
  async findPasswordByEmail(@Payload() email: string) {
    try {
      const user = await this.usersService.findPassword(email);
      return user;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.find_by_email')
  async findOneByEmail(@Payload() email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      return user;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.find_by_github_uid')
  async findOneByGithubUid(@Payload() githubUid: number) {
    try {
      const user = await this.usersService.findOneByGithubUid(githubUid);
      return user;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.update')
  async update(
    @Payload()
    params: {
      userId: string;
      updateUserDto: UpdateUserDto;
      updatedBy: string;
    },
  ) {
    try {
      const updatedRecord = await this.usersService.update(
        params.userId,
        params.updateUserDto,
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

  @MessagePattern('user.remove')
  async remove(@Payload() id: string) {
    try {
      await this.usersService.remove(id);
      return id;
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.follow')
  async followUser(@Payload() params: { from: string; to: string }) {
    try {
      if (params.from === params.to)
        throw new RpcException({
          message: 'Bad request',
          status: HttpStatus.CONFLICT,
        });
      return await this.usersService.followUser(params.from, params.to);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.unfollow')
  async unfollowUser(@Payload() params: { from: string; to: string }) {
    try {
      if (params.from === params.to)
        throw new RpcException({
          message: 'Bad request',
          status: HttpStatus.CONFLICT,
        });
      return await this.usersService.unfollowUser(params.from, params.to);
    } catch (error) {
      const e = error instanceof RpcException ? error.getError() : error;
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }

  @MessagePattern('user.find_followers')
  async findAllFollowers(
    @Payload() params: { userId: string; queryDto: QueryDto },
  ) {
    try {
      const res = await this.usersService.findAllFollowers(
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

  @MessagePattern('user.find_following')
  async findAllFollowing(
    @Payload() params: { userId: string; queryDto: QueryDto },
  ) {
    try {
      const res = await this.usersService.findAllFollowing(
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
}
