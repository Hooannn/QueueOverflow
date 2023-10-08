import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import config from './configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { TopicsModule } from './topics/topics.module';
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
    RedisModule,
    TopicsModule
  ],
  controllers: [AppController],
})
export class AppModule {}
