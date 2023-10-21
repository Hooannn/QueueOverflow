import { Module } from '@nestjs/common';
import { NotificationsWebsocketGateway } from './notifications.gateway';
import { RedisSubscriberModule } from 'src/redis/redis.subscriber';
import { PostsWebsocketGateway } from './posts.gateway';

@Module({
  imports: [RedisSubscriberModule],
  providers: [NotificationsWebsocketGateway, PostsWebsocketGateway],
})
export class WebsocketModule {}
