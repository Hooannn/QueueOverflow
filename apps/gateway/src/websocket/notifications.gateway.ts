import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PinoLogger } from 'nestjs-pino';
import config from 'src/configs';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsWebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly logger: PinoLogger,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriberClient: Redis,
  ) {
    this.redisSubscriberClient.subscribe('events');
    this.redisSubscriberClient.on('message', (ch, message) => {
      if (ch === 'events') {
        const data = JSON.parse(message);
        if (data.event === 'new-notifications')
          this.handleNewNotifications(data);
      }
    });
  }
  @WebSocketServer()
  server: Server;

  async handleNewNotifications(payload: { token: string; uids: string[] }) {
    const secretKey = config.SOCKET_EVENT_SECRET;
    const token = payload.token;
    if (token !== secretKey) return;
    const uids = payload.uids;
    const sockets = (await this.server.fetchSockets()).filter((socket) =>
      uids.includes(socket.handshake?.headers?.uid as string),
    );
    sockets.forEach((socket) =>
      socket.emit('new-notifications', {
        uid: socket.handshake?.headers?.uid,
      }),
    );
  }

  afterInit(server: Server) {
    this.logger.info('Notifications websocket gateway initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.info('New client connected to notifications websocket gateway');
  }

  handleDisconnect(client: any) {
    this.logger.info(
      'Client disconnected from notifications websocket gateway',
    );
  }
}
