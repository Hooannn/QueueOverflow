import { Controller } from '@nestjs/common';
import { SearchService } from './search.service';
import { EventPattern } from '@nestjs/microservices';
import { Topic } from '@queueoverflow/shared/entities';
@Controller()
export class TopicsController {
  constructor(private readonly searchService: SearchService) {}

  @EventPattern('topic.created')
  async onTopicCreated(topics: Topic[]) {}
}
