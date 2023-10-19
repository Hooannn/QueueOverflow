import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Follow,
  Notification,
  Post,
  Subscription,
  User,
} from '@queueoverflow/shared/entities';
import { CreateNotificationDto, QueryDto } from '@queueoverflow/shared/dtos';
import { firstValueFrom } from 'rxjs';
import { registerTemplate } from 'src/mailer/templates/password';
import { welcomeTemplate } from 'src/mailer/templates/welcome';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import config from 'src/configs';
import { Redis } from 'ioredis';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { query } from 'express';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
    private readonly mailerService: MailerService,
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly logger: PinoLogger,
    @Inject('REDIS') private readonly redisClient: Redis,
  ) {}

  private async sendMail(mailOptions: ISendMailOptions) {
    return this.mailerService.sendMail(mailOptions);
  }

  async sendGeneratedPasswordMail(email: string, password: string) {
    const mailOptions: ISendMailOptions = {
      to: email,
      subject: 'Register account - QueueOverflow',
      html: registerTemplate(password),
    };
    return await this.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string) {
    const mailOptions: ISendMailOptions = {
      to: email,
      subject: 'Welcome - QueueOverflow',
      html: welcomeTemplate(),
    };
    return await this.sendMail(mailOptions);
  }

  async notifyPostCreated(postId: string) {
    try {
      const post = await firstValueFrom<Post>(
        this.postsClient.send('post.find_by_id', postId),
      );

      if (!post.publish) return;
      const [...subs] = await Promise.all(
        post.topicIds.map((topicId) =>
          this.findSubscriptionsByTopicId(topicId),
        ),
      );

      const { data: followers } = await firstValueFrom<{
        data: Follow[];
        total?: number;
      }>(
        this.usersClient.send('user.find_followers', {
          userId: post.created_by,
        }),
      );

      const followerUids = followers.map((follower) => follower.from_uid);

      const subscriberUids = subs
        .reduce((prev, current) => {
          return [...prev, ...current];
        }, [])
        .map((sub) => sub.uid);

      const uidsToNotify = Array.from(
        new Set([...followerUids, ...subscriberUids]),
      ).filter((uid) => uid !== post.created_by);

      const notificationBody = {
        title: 'New Post',
        content: `${this.getUserName(
          post.creator,
        )} created a new post with title "${
          post.title
        }"${this.generateTopicsName(post)}`,
      };

      const createNotificationsDto: CreateNotificationDto[] = uidsToNotify.map(
        (uid) => ({
          recipient_id: uid,
          ...notificationBody,
        }),
      );

      // Save notifications to db
      await this.createMultiple(createNotificationsDto);
      // Emit socket events
      this.redisClient.publish(
        'events',
        JSON.stringify({
          event: 'new-notifications',
          token: config.SOCKET_EVENT_SECRET,
          uids: uidsToNotify,
        }),
      );
      // Push notifications
      this.pushNotificationsService.push(uidsToNotify, notificationBody);
    } catch (error) {
      this.logger.error(
        'Error handling notifyPostCreated',
        JSON.stringify(error),
      );
    }
  }

  private generateTopicsName(post: Post): string {
    if (post.topics.length) {
      return (
        ' in topics:' +
        post.topics.map((topic) => `"${topic.title}"`).join(', ') +
        '.'
      );
    }
    return '';
  }

  private getUserName(user: User) {
    if (!user.first_name && !user.last_name) return user.email;
    return `${user.first_name} ${user.last_name}`;
  }

  private async findSubscriptionsByTopicId(topicId: string) {
    const subscriptions = await firstValueFrom<{
      data: Subscription[];
      total?: number;
    }>(this.postsClient.send('subscription.find_by_topic', { topicId }));

    return subscriptions.data;
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );

    return await this.notificationsRepository.save(notification);
  }

  async createMultiple(createNotificationsDto: CreateNotificationDto[]) {
    return await this.notificationsRepository.insert(createNotificationsDto);
  }

  async findAll(userId: string, queryDto: QueryDto) {
    const findOptions: FindManyOptions<Notification> = {
      skip: queryDto.offset,
      take: queryDto.limit,
      where: {
        recipient_id: userId,
      },
      order: {
        created_at: -1,
      },
    };
    const countOptions: FindManyOptions<Notification> = {
      select: { id: true },
      where: findOptions.where,
    };

    const [data, total] = await Promise.all([
      this.notificationsRepository.find(findOptions),
      this.notificationsRepository.count(countOptions),
    ]);

    return {
      data,
      total,
    };
  }

  async findOne(userId: string, notificationId: string) {
    const res = await this.notificationsRepository.findOne({
      where: {
        id: notificationId,
        recipient_id: userId,
      },
    });
    return res;
  }

  async markAsRead(userId: string, notificationId: string) {
    return await this.notificationsRepository.update(
      { id: notificationId, recipient_id: userId },
      { read: true },
    );
  }

  async markAllAsRead(userId: string) {
    return await this.notificationsRepository.update(
      { recipient_id: userId },
      { read: true },
    );
  }
}
