import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpException,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/auth.roles';
import { hashSync } from 'bcrypt';
import config from 'src/configs';
import { Role, User } from '@queueoverflow/shared/entities';
import {
  ChangePasswordDto,
  CreateUserDto,
  QueryDto,
  UpdateUserDto,
} from '@queueoverflow/shared/dtos';
import { Response } from '@queueoverflow/shared/utils';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin)
  async create(@Req() req, @Body() createUserDto: CreateUserDto) {
    createUserDto.password = hashSync(
      createUserDto.password,
      parseInt(config.SALTED_PASSWORD),
    );
    const user = await this.usersService.create(
      createUserDto,
      req.auth?.userId,
    );

    return new Response<User>({
      code: 201,
      success: true,
      message: 'Created',
      data: user,
    });
  }

  @Get()
  @Roles(Role.Admin)
  async findAll(@Query() query: QueryDto) {
    const { data, total } = await this.usersService.findAll(query);

    return new Response<User[]>({
      code: 200,
      success: true,
      total,
      took: data.length,
      data,
    });
  }

  @Get('/profile')
  async findAuthenticatedUser(@Request() req) {
    const authUser = req.auth;
    const userId = authUser?.userId;
    if (!userId) throw new HttpException('Unknown user', HttpStatus.FORBIDDEN);
    const user = await this.usersService.findOne(userId);

    return new Response<User>({
      code: 200,
      success: true,
      data: user,
    });
  }

  @Patch('/profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const authUser = req.auth;
    const userId = authUser?.userId;
    if (!userId) throw new HttpException('Unknown user', HttpStatus.FORBIDDEN);
    delete updateUserDto.email;
    delete updateUserDto.roles;
    delete updateUserDto.password;
    const user = await this.usersService.update(userId, updateUserDto, userId);

    return new Response<User>({
      code: 200,
      success: true,
      data: user,
      message: 'Updated',
    });
  }

  @Patch('/profile/password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const authUser = req.auth;
    const userId = authUser?.userId;
    if (!userId) throw new HttpException('Unknown user', HttpStatus.FORBIDDEN);
    const user = await this.usersService.changePassword(
      userId,
      changePasswordDto,
    );

    return new Response<User>({
      code: 200,
      success: true,
      data: user,
      message: 'Updated',
    });
  }

  @Get(':id')
  @Roles(Role.Admin)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);

    return new Response<User>({
      code: 200,
      success: true,
      data: user,
    });
  }

  @Patch(':id')
  @Roles(Role.Admin)
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto.password) {
      updateUserDto.password = hashSync(
        updateUserDto.password,
        parseInt(config.SALTED_PASSWORD),
      );
    }
    const updatedRecord = await this.usersService.update(
      +id,
      updateUserDto,
      req.auth?.userId,
    );

    return new Response<User>({
      code: 200,
      success: true,
      data: updatedRecord,
      message: 'Updated',
    });
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(+id);

    return new Response<any>({
      code: 200,
      success: true,
      data: { id },
      message: 'Deleted',
    });
  }
}
