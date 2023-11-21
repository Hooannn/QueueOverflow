import { Module } from '@nestjs/common';
import { UserHistoriesService } from './user_histories.service';
import { UserHistoriesController } from './user_histories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHistory } from '@queueoverflow/shared/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserHistory])],
  controllers: [UserHistoriesController],
  providers: [UserHistoriesService],
})
export class UserHistoriesModule {}
