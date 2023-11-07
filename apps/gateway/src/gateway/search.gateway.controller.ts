import {
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Query,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from '@queueoverflow/shared/utils';
import { Topic } from '@queueoverflow/shared/entities';

@Controller({
  version: '1',
  path: 'v1/search',
})
export class SearchGatewayController {
  constructor(
    @Inject('CMS_SERVICE')
    private readonly cmsClient: ClientProxy,
  ) {}

  @Get('topics')
  async findAllSubscriptions(@Query('q') query: string) {
    try {
      const { total, data } = await firstValueFrom<{
        total: number;
        data: Topic[];
      }>(
        this.cmsClient.send('topic.search', {
          q: query,
        }),
      );

      return new Response<Topic[]>({
        code: 200,
        success: true,
        took: data.length,
        data,
        total,
      });
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
