import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import config from './configs';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersGatewayController } from './gateway/user.gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CmsGatewayController } from './gateway/cms.gateway.controller';
import { PostsGatewayController } from './gateway/posts.gateway.controller';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.PGHOST,
      database: config.PGDATABASE,
      username: config.PGUSER,
      password: config.PGPASSWORD,
      logging: config.NODE_ENV !== 'production',
      port: 5432,
      ssl: true,
      autoLoadEntities: true,
      synchronize: true,
    }),
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
    RedisModule,
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
    ]),
    ClientsModule.register([
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
    ]),
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
    ]),
  ],
  controllers: [
    AppController,
    UsersGatewayController,
    CmsGatewayController,
    PostsGatewayController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
