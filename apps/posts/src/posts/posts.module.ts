import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {
  Post,
  Subscription,
  Vote,
  Comment,
} from '@queueoverflow/shared/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subcriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import config from 'src/configs';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Subscription, Vote, Comment]),
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [config.RABBITMQ_URL],
          queue: 'notifications_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [PostsController, SubscriptionsController],
  providers: [PostsService, SubscriptionsService],
})
export class PostsModule {}
