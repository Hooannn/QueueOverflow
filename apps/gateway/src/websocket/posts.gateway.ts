import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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

  async handleNewComment(payload: {
    token: string;
    postId: string;
    creatorId: string;
  }) {
    const secretKey = config.SOCKET_EVENT_SECRET;
    const token = payload.token;
    if (token !== secretKey) return;
    const postId = payload.postId;

    this.server.to(`post:${postId}`).emit('comment:create', {
      creatorId: payload.creatorId,
    });
  }

  @SubscribeMessage('subscribe')
  onClientSubscribe(
    @MessageBody() postId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`post:${postId}`);

    client.on('disconnect', () => {
      client.leave(`post:${postId}`);
    });
  }

  afterInit(server: Server) {
    this.logger.info('posts websocket gateway initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.info('New client connected to posts websocket gateway');
  }

  handleDisconnect(client: any) {
    this.logger.info('Client disconnected from posts websocket gateway');
  }
}
