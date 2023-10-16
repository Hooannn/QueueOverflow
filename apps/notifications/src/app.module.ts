import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { MailerModule } from '@nestjs-modules/mailer';
import config from './configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from './notifications/notifications.module';
import { RedisModule } from './redis/redis.module';
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
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: config.GMAIL_USER,
          pass: config.GMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '<noreply@any.com>',
      },
    }),
    NotificationsModule,
    RedisModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
