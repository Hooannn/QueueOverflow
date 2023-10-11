import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import config from 'src/configs';
import Redis from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, Repository } from 'typeorm';
import {
  CreateUserDto,
  QueryDto,
  ChangePasswordDto,
  UpdateUserDto,
} from '@queueoverflow/shared/dtos';
import { Follow, User } from '@queueoverflow/shared/entities';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    @Inject('REDIS') private readonly redisClient: Redis,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  private findOptionsSelect: FindOptionsSelect<User> = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    roles: true,
    avatar: true,
    meta_data: true,
  };

  async checkUser(params: { email: string }) {
    const res = await this.usersRepository.findOne({
      select: {
        first_name: true,
        last_name: true,
        email: true,
        id: true,
      },
      where: {
        email: params.email,
      },
    });
    return res;
  }

  async create(createUserDto: CreateUserDto, createdBy?: string) {
    const user = this.usersRepository.create(createUserDto);
    const res = await this.usersRepository.save(user);
    delete res.password;
    this.notificationsClient.emit('mail.send.welcome', {
      email: user.email,
    });
    return res;
  }

  async findAll(queryDto: QueryDto) {
    const [data, total] = await Promise.all([
      this.usersRepository.find({
        select: this.findOptionsSelect,
        skip: queryDto.offset,
        take: queryDto.limit,
      }),

      this.usersRepository.count({ select: { id: true } }),
    ]);

    return {
      data,
      total,
    };
  }

  async findAllFollowers(userId: string, queryDto: QueryDto) {
    const [data, total] = await Promise.all([
      this.followsRepository.find({
        skip: queryDto.offset,
        take: queryDto.limit,
        where: {
          to_uid: userId,
        },
        relations: {
          from_user: true,
        },
        select: {
          from_user: { ...this.findOptionsSelect, roles: false },
        },
      }),

      this.followsRepository.count({
        select: { to_uid: true },
        where: {
          to_uid: userId,
        },
      }),
    ]);

    return {
      data,
      total,
    };
  }

  async findAllFollowing(userId: string, queryDto: QueryDto) {
    const [data, total] = await Promise.all([
      this.followsRepository.find({
        skip: queryDto.offset,
        take: queryDto.limit,
        relations: {
          to_user: true,
        },
        where: {
          from_uid: userId,
        },
        select: {
          to_user: { ...this.findOptionsSelect, roles: false },
        },
      }),

      this.followsRepository.count({
        select: { from_uid: true },
        where: {
          from_uid: userId,
        },
      }),
    ]);

    return {
      data,
      total,
    };
  }

  async findOne(id: string) {
    const res = await this.usersRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        id,
      },
    });
    return res;
  }

  async findOneByEmail(email: string) {
    const res = await this.usersRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        email,
      },
    });
    return res;
  }

  async findOneByGithubUid(githubUid: number) {
    const res = await this.usersRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        meta_data: {
          github_uid: githubUid,
        },
      },
    });
    return res;
  }

  async findPassword(email: string) {
    const res = await this.usersRepository.findOne({
      select: {
        password: true,
        id: true,
      },
      where: {
        email,
      },
    });
    return res;
  }

  async findPasswordById(id: string) {
    const res = await this.usersRepository.findOne({
      select: {
        password: true,
        id: true,
      },
      where: {
        id,
      },
    });
    return res;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.findPasswordById(id);
    if (!user)
      throw new RpcException({
        message: 'No such user',
        status: HttpStatus.BAD_REQUEST,
      });

    const isCurrentPasswordValid = compareSync(
      changePasswordDto.current_password,
      user.password,
    );
    if (!isCurrentPasswordValid)
      throw new RpcException({
        message: 'Invalid password',
        status: HttpStatus.FORBIDDEN,
      });

    const newPassword = hashSync(
      changePasswordDto.new_password,
      parseInt(config.SALTED_PASSWORD),
    );

    const res = await this.update(
      id,
      {
        password: newPassword,
      },
      id,
    );

    await this.redisClient.del(`refresh_token:${id}`);
    return res;
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy?: string) {
    await this.usersRepository.update(id, updateUserDto);

    return await this.findOne(id);
  }

  async remove(id: string) {
    const res = await this.usersRepository.delete(id);
    return res;
  }

  async followUser(from_uid: string, to_uid: string) {
    const isExisted = await this.followsRepository.findOne({
      where: { from_uid, to_uid },
    });

    if (isExisted)
      throw new RpcException({
        message: 'Bad request',
        status: HttpStatus.CONFLICT,
      });

    const newFollow = this.followsRepository.create({ from_uid, to_uid });
    const res = await this.followsRepository.save(newFollow);
    return res;
  }
}
