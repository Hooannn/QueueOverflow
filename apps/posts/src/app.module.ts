import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import config from './configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { Topic, User } from '@queueoverflow/shared/entities';
import { SavedPostsModule } from './saved_posts/saved_posts.module';
import { PostSubscriptionsModule } from './post_subscriptions/post_subscriptions.module';
import { UserHistoriesModule } from './user_histories/user_histories.module';
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
      ssl: false,
      autoLoadEntities: true,
      entities: [User, Topic],
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
    SavedPostsModule,
    PostSubscriptionsModule,
    UserHistoriesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
