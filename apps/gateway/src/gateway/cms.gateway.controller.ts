import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Get,
  Delete,
  ParseArrayPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateTopicDto,
  CreateUserDto,
  QueryDto,
  UpdateTopicDto,
} from '@queueoverflow/shared/dtos';
import {
  Follow,
  Role,
  Subscription,
  Topic,
  User,
} from '@queueoverflow/shared/entities';
import { firstValueFrom } from 'rxjs';
import { Roles } from 'src/auth/auth.roles';
import { Response } from '@queueoverflow/shared/utils';

@Controller({
  version: '1',
  path: 'cms/v1',
})
export class CmsGatewayController {
  constructor(
    @Inject('CMS_SERVICE')
    private readonly cmsClient: ClientProxy,
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  @Post('/topics')
  @Roles(Role.Admin)
  async createTopic(@Req() req, @Body() createTopicDto: CreateTopicDto) {
    try {
      const topic = await firstValueFrom<Topic>(
        this.cmsClient.send('topic.create', {
          createTopicDto,
          createdBy: req.auth?.userId,
        }),
      );

      return new Response<Topic>({
        code: 201,
        success: true,
        message: 'Created',
        data: topic,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/topics/many')
  @Roles(Role.Admin)
  async createTopics(@Req() req, @Body() createTopicsDto: CreateTopicDto[]) {
    try {
      const topic = await firstValueFrom<Topic[]>(
        this.cmsClient.send('topic.create_many', {
          createTopicsDto,
          createdBy: req.auth?.userId,
        }),
      );

      return new Response<Topic[]>({
        code: 201,
        success: true,
        message: 'Created',
        data: topic,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/topics/:id')
  @Roles(Role.Admin)
  async updateTopic(
    @Req() req,
    @Body() updateTopicDto: UpdateTopicDto,
    @Param('id') id: string,
  ) {
    try {
      const topic = await firstValueFrom<Topic>(
        this.cmsClient.send('topic.update', {
          topicId: id,
          updateTopicDto,
          updatedBy: req.auth?.userId,
        }),
      );

      return new Response<Topic>({
        code: 200,
        success: true,
        message: 'Updated',
        data: topic,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/topics')
  async findAllTopics(
    @Query() queryDto: QueryDto,
    @Query('relations', new ParseArrayPipe({ optional: true }))
    relations?: string[],
  ) {
    try {
      const { data, total } = await firstValueFrom<{
        data: Topic[];
        total?: number;
      }>(this.cmsClient.send('topic.find_all', { ...queryDto, relations }));

      return new Response<Topic[]>({
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

  @Get('/topics/:id')
  async findOne(@Param('id') id: string) {
    try {
      const topic = await firstValueFrom<Topic>(
        this.cmsClient.send('topic.find_by_id', id),
      );

      return new Response<Topic>({
        code: 200,
        success: true,
        data: topic,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/topics/:id')
  @Roles(Role.Admin)
  async remove(@Param('id') id: string, @Req() req) {
    try {
      const removedId = await firstValueFrom<string>(
        this.cmsClient.send('topic.remove', {
          id,
          removedBy: req.auth?.userId,
        }),
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

  @Delete('/topics')
  @Roles(Role.Admin)
  async removeAll() {
    try {
      const res = await firstValueFrom<boolean>(
        this.cmsClient.send('topic.remove_all', {}),
      );

      return new Response<{ id: string }>({
        code: 200,
        success: res,
        message: 'Deleted',
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/subscriptions')
  @Roles(Role.Admin)
  async createSubscription(
    @Body('uid') uid: string,
    @Body('topic_id') topic_id: string,
  ) {
    try {
      const subscription = await firstValueFrom<Subscription>(
        this.postsClient.send('subscription.topic.create', {
          userId: uid,
          topicId: topic_id,
        }),
      );

      return new Response<Subscription>({
        code: 201,
        success: true,
        message: 'Created',
        data: subscription,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/follows')
  @Roles(Role.Admin)
  async createFollow(
    @Body('from_uid') from_uid: string,
    @Body('to_uid') to_uid: string,
  ) {
    try {
      const follow = await firstValueFrom<Follow>(
        this.usersClient.send('user.follow', {
          from: from_uid,
          to: to_uid,
        }),
      );

      return new Response<Follow>({
        code: 201,
        success: true,
        message: 'Created',
        data: follow,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/users')
  @Roles(Role.Admin)
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await firstValueFrom<User>(
        this.usersClient.send('user.create', { createUserDto }),
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
}
