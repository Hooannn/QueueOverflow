import { Module } from '@nestjs/common';
import { NotificationsWebsocketGateway } from './notifications.gateway';
import { RedisSubscriberModule } from 'src/redis/redis.subscriber';

@Module({
  imports: [RedisSubscriberModule],
  providers: [NotificationsWebsocketGateway],
})
export class WebsocketModule {}
