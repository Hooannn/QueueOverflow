import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import config from 'src/configs';

@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: () => {
        const client = new Redis({
          host: config.REDIS_HOST,
          port: parseInt(config.REDIS_PORT),
          password: config.REDIS_PASSWORD,
        });
        return client;
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
