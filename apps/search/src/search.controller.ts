import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Topic } from '@queueoverflow/shared/entities';
@Controller()
export class SearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @MessagePattern('topic.search')
  async searchTopic(@Payload() params: { q: string }) {
    try {
      const docs = await this.elasticsearchService.search<Topic>({
        index: 'topic',
        query: {
          bool: {
            should: [
              {
                fuzzy: {
                  title: {
                    value: params.q,
                    fuzziness: 'AUTO',
                  },
                },
              },
              {
                fuzzy: {
                  description: {
                    value: params.q,
                    fuzziness: 'AUTO',
                  },
                },
              },
            ],
          },
        },
      });
      return {
        total: (docs?.hits?.total as any)?.value ?? 0,
        data: docs?.hits?.hits.map((raw) => raw._source) ?? [],
      };
    } catch (e) {
      throw new RpcException({
        message: e?.message || 'Invalid request',
        status: e?.status || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
