import { Test, TestingModule } from '@nestjs/testing';
import { PostSubscriptionsController } from './post_subscriptions.controller';
import { PostSubscriptionsService } from './post_subscriptions.service';

describe('PostSubscriptionsController', () => {
  let controller: PostSubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostSubscriptionsController],
      providers: [PostSubscriptionsService],
    }).compile();

    controller = module.get<PostSubscriptionsController>(PostSubscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
