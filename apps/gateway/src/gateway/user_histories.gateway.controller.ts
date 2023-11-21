import {
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Query,
  Get,
  Req,
  Param,
  ParseArrayPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from '@queueoverflow/shared/utils';
import { Post, UserHistory } from '@queueoverflow/shared/entities';
import { QueryDto } from '@queueoverflow/shared/dtos';

@Controller({
  version: '1',
  path: 'v1/user_histories',
})
export class UserHistoriesGatewayController {
  constructor(
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @Query() queryDto: QueryDto,
    @Req() req,
    @Query('relations', new ParseArrayPipe({ optional: true }))
    relations?: string[],
  ) {
    try {
      const { data, total } = await firstValueFrom<{
        data: UserHistory[];
        total?: number;
      }>(
        this.postsClient.send('user_history.find_all', {
          query: { ...queryDto, relations },
          userId: req.auth?.userId,
        }),
      );

      return new Response<Post[]>({
        code: 200,
        success: true,
        total,
        took: data.length,
        data: data.map((userHistory) => userHistory.post),
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
