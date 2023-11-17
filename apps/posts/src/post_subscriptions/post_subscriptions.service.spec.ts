import { Test, TestingModule } from '@nestjs/testing';
import { PostSubscriptionsService } from './post_subscriptions.service';

describe('PostSubscriptionsService', () => {
  let service: PostSubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostSubscriptionsService],
    }).compile();

    service = module.get<PostSubscriptionsService>(PostSubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
