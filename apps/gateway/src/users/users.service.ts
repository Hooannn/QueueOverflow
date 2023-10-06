import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
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
import { User } from '@queueoverflow/shared/entities';

@Injectable()
export class UsersService {
  constructor(
    @Inject('REDIS') private readonly redisClient: Redis,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  private findOptionsSelect: FindOptionsSelect<User> = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    roles: true,
    avatar: true,
  };

  async checkUser(params: { email: string }) {
    try {
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
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async create(createUserDto: CreateUserDto, createdBy?: string) {
    try {
      const user = this.usersRepository.create(createUserDto);
      const res = await this.usersRepository.save(user);
      delete res.password;
      return res;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query: QueryDto) {
    try {
      const [data, total] = await Promise.all([
        this.usersRepository.find({
          select: this.findOptionsSelect,
          skip: query.offset,
          take: query.limit,
        }),

        this.usersRepository.count({ select: { id: true } }),
      ]);

      return {
        data,
        total,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      const res = await this.usersRepository.findOne({
        select: this.findOptionsSelect,
        where: {
          id,
        },
      });
      return res;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOneByEmail(email: string) {
    try {
      const res = await this.usersRepository.findOne({
        select: this.findOptionsSelect,
        where: {
          email,
        },
      });
      return res;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findPassword(email: string) {
    try {
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
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findPasswordById(id: string) {
    try {
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
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.findPasswordById(id);
      if (!user)
        throw new HttpException('No such user', HttpStatus.BAD_REQUEST);
      const isCurrentPasswordValid = compareSync(
        changePasswordDto.current_password,
        user.password,
      );
      if (!isCurrentPasswordValid)
        throw new ForbiddenException('Invalid password');

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
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy?: string) {
    try {
      await this.usersRepository.update(id, updateUserDto);

      return await this.findOne(id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.usersRepository.delete(id);
      return res;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
