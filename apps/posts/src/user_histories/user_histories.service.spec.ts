import { Test, TestingModule } from '@nestjs/testing';
import { UserHistoriesService } from './user_histories.service';

describe('UserHistoriesService', () => {
  let service: UserHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserHistoriesService],
    }).compile();

    service = module.get<UserHistoriesService>(UserHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
