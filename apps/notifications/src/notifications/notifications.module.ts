import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import config from 'src/configs';
import { Notification, User } from '@queueoverflow/shared/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/redis/redis.module';
import { PushNotificationsModule } from 'src/push-notifications/push-notifications.module';

@Module({
  imports: [
    PushNotificationsModule,
    RedisModule,
    TypeOrmModule.forFeature([Notification, User]),
    ClientsModule.register([
      {
        name: 'POSTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [config.RABBITMQ_URL],
          queue: 'posts_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [config.RABBITMQ_URL],
          queue: 'users_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
