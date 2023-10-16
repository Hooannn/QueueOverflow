import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import config from './configs';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { UsersGatewayController } from './gateway/user.gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CmsGatewayController } from './gateway/cms.gateway.controller';
import { PostsGatewayController } from './gateway/posts.gateway.controller';
import { SubscriptionsGatewayController } from './gateway/subcriptions.gateway.controller';
import { WebsocketModule } from './websocket/module';
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          config.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    AuthModule,
    JwtModule.register({
      global: false,
      secret: config.JWT_AUTH_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    ClientsModule.register([
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
      {
        name: 'CMS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [config.RABBITMQ_URL],
          queue: 'cms_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
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
    WebsocketModule,
  ],
  controllers: [
    AppController,
    UsersGatewayController,
    CmsGatewayController,
    PostsGatewayController,
    SubscriptionsGatewayController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
