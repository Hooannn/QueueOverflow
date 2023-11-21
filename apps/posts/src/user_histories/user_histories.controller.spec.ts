import { Test, TestingModule } from '@nestjs/testing';
import { UserHistoriesController } from './user_histories.controller';
import { UserHistoriesService } from './user_histories.service';

describe('UserHistoriesController', () => {
  let controller: UserHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserHistoriesController],
      providers: [UserHistoriesService],
    }).compile();

    controller = module.get<UserHistoriesController>(UserHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
