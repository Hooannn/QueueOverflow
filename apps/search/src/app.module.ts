import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import config from './configs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import * as fs from 'fs';
import { SyncController } from './sync.controller';
@Module({
  imports: [
    ElasticsearchModule.register({
      node: config.ELASTICSEARCH_NODE,
      auth: {
        username: config.ELASTICSEARCH_USERNAME,
        password: config.ELASTICSEARCH_PASSWORD,
      },
      tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false,
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          config.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
  ],
  controllers: [AppController, SyncController],
  providers: [SearchService],
})
export class AppModule {}
