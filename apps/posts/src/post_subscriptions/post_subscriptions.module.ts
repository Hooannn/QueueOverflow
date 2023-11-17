import { Module } from '@nestjs/common';
import { PostSubscriptionsService } from './post_subscriptions.service';
import { PostSubscriptionsController } from './post_subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostSubscription } from '@queueoverflow/shared/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PostSubscription])],
  controllers: [PostSubscriptionsController],
  providers: [PostSubscriptionsService],
})
export class PostSubscriptionsModule {}
