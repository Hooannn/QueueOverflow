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
  namespace: 'posts',
})
export class PostsWebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly logger: PinoLogger,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriberClient: Redis,
  ) {
    this.redisSubscriberClient.subscribe('posts');
    this.redisSubscriberClient.on('message', (ch, message) => {
      if (ch === 'posts') {
        const data = JSON.parse(message);
        if (data.event === 'new-comment') this.handleNewComment(data);
      }
    });
  }
  @WebSocketServer()
  server: Server;

  async handleNewComment(payload: { token: string; postId: string }) {
    const secretKey = config.SOCKET_EVENT_SECRET;
    const token = payload.token;
    if (token !== secretKey) return;
    const postId = payload.postId;

    const serverSockets = await this.server.fetchSockets();

    const socketsToNotify = serverSockets.filter(
      (socket) => socket.handshake?.headers?.postId === postId,
    );

    socketsToNotify.forEach((socket) =>
      socket.emit('new-comment', {
        postId: socket.handshake?.headers?.postId,
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
