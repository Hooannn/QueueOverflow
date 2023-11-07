import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDto,
  QueryDto,
  UpdateUserDto,
  ChangePasswordDto,
} from '@queueoverflow/shared/dtos';
import { Follow, Role, User } from '@queueoverflow/shared/entities';
import { hashSync } from 'bcryptjs';
import { firstValueFrom } from 'rxjs';
import { Roles } from 'src/auth/auth.roles';
import { Response } from '@queueoverflow/shared/utils';
import config from 'src/configs';

@Controller({
  version: '1',
  path: 'v1/users',
})
export class UsersGatewayController {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  @Post()
  @Roles(Role.Admin)
  async create(@Req() req, @Body() createUserDto: CreateUserDto) {
    try {
      createUserDto.password = hashSync(
        createUserDto.password,
        parseInt(config.SALTED_PASSWORD),
      );

      const user = await firstValueFrom<User>(
        this.usersClient.send('user.create', {
          createUserDto,
          createdBy: req.auth?.userId,
        }),
      );

      return new Response<User>({
        code: 201,
        success: true,
        message: 'Created',
        data: user,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Roles(Role.Admin)
  async findAll(@Query() queryDto: QueryDto) {
    try {
      const { data, total } = await firstValueFrom<{
        data: User[];
        total?: number;
      }>(this.usersClient.send('user.find_all', queryDto));

      return new Response<User[]>({
        code: 200,
        success: true,
        total,
        took: data.length,
        data,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('profile')
  async findAuthenticatedUser(@Request() req) {
    try {
      const authUser = req.auth;
      const userId = authUser?.userId;
      if (!userId)
        throw new HttpException('Unknown user', HttpStatus.FORBIDDEN);
      const user = await firstValueFrom<User>(
        this.usersClient.send('user.find_by_id', userId),
      );
      return new Response<User>({
        code: 200,
        success: true,
        data: user,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    try {
      const authUser = req.auth;
      const userId = authUser?.userId;
      if (!userId)
        throw new HttpException('Unknown user', HttpStatus.FORBIDDEN);
      delete updateUserDto.email;
      delete updateUserDto.roles;
      delete updateUserDto.password;
      const user = await firstValueFrom<User>(
        this.usersClient.send('user.update', {
          userId,
          updateUserDto,
          updatedBy: userId,
        }),
      );
      return new Response<User>({
        code: 200,
        success: true,
        data: user,
        message: 'Updated',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('profile/password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const authUser = req.auth;
      const userId = authUser?.userId;
      if (!userId)
        throw new HttpException('Unknown user', HttpStatus.FORBIDDEN);

      const user = await firstValueFrom<User>(
        this.usersClient.send('user.change_password', {
          userId,
          changePasswordDto,
        }),
      );

      return new Response<User>({
        code: 200,
        success: true,
        data: user,
        message: 'Updated',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @Roles(Role.Admin)
  async findOne(@Param('id') id: string) {
    try {
      const user = await firstValueFrom<User>(
        this.usersClient.send('user.find_by_id', id),
      );
      return new Response<User>({
        code: 200,
        success: true,
        data: user,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  @Roles(Role.Admin)
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = hashSync(
          updateUserDto.password,
          parseInt(config.SALTED_PASSWORD),
        );
      }

      const updatedRecord = await firstValueFrom<User>(
        this.usersClient.send('user.update', {
          userId: id,
          updateUserDto,
          updatedBy: req.auth?.userId,
        }),
      );

      return new Response<User>({
        code: 200,
        success: true,
        data: updatedRecord,
        message: 'Updated',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    try {
      const removedId = await firstValueFrom<string>(
        this.usersClient.send('user.remove', id),
      );

      return new Response<{ id: string }>({
        code: 200,
        success: true,
        data: { id: removedId },
        message: 'Deleted',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('follow/:id')
  async followUser(@Param('id') id: string, @Req() req) {
    try {
      if (req.auth?.userId == id)
        throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);

      const res = await firstValueFrom<Follow>(
        this.usersClient.send('user.follow', {
          from: req.auth?.userId,
          to: id,
        }),
      );

      return new Response<Follow>({
        code: 200,
        success: true,
        data: res,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('follow/:id')
  async unfollowUser(@Param('id') id: string, @Req() req) {
    try {
      if (req.auth?.userId == id)
        throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);

      await firstValueFrom<unknown>(
        this.usersClient.send('user.unfollow', {
          from: req.auth?.userId,
          to: id,
        }),
      );

      return new Response<unknown>({
        code: 200,
        success: true,
        message: 'Success',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('follow/followers')
  async findAllFollowers(@Req() req, @Query() queryDto: QueryDto) {
    try {
      const { data, total } = await firstValueFrom<{
        data: Follow[];
        total: number;
      }>(
        this.usersClient.send('user.find_followers', {
          userId: req.auth?.userId,
          queryDto,
        }),
      );

      return new Response<Follow[]>({
        code: 200,
        success: true,
        data,
        total,
        took: data.length,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('follow/following')
  async findAllFollowing(@Req() req, @Query() queryDto: QueryDto) {
    try {
      const { data, total } = await firstValueFrom<{
        data: Follow[];
        total: number;
      }>(
        this.usersClient.send('user.find_following', {
          userId: req.auth?.userId,
          queryDto,
        }),
      );

      return new Response<Follow[]>({
        code: 200,
        success: true,
        data,
        total,
        took: data.length,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
