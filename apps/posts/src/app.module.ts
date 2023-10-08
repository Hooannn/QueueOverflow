import { Module, Post } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import config from './configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { Topic } from '@queueoverflow/shared/entities';
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
      entities: [Topic],
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
    RedisModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
