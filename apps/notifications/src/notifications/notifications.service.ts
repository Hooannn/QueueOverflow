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
  Comment,
  PostSubscription,
} from '@queueoverflow/shared/entities';
import { CreateNotificationDto, QueryDto } from '@queueoverflow/shared/dtos';
import { firstValueFrom } from 'rxjs';
import { registerTemplate } from 'src/mailer/templates/password';
import { welcomeTemplate } from 'src/mailer/templates/welcome';
import { FindManyOptions, FindOptionsSelect, Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import config from 'src/configs';
import { Redis } from 'ioredis';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';

class InternalCreateNotificationDto extends CreateNotificationDto {
  created_by?: string;
}

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

  private userFindOptionsSelect: FindOptionsSelect<User> = {
    first_name: true,
    last_name: true,
    avatar: true,
    id: true,
  };

  private findOptionsSelect: FindOptionsSelect<Notification> = {
    creator: this.userFindOptionsSelect,
  };

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

      const [...subs] = await Promise.all(
        post.topics.map((topic) => this.findSubscriptionsByTopicId(topic.id)),
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
        meta_data: {
          action_url: `${new URL(config.CLIENT_BASE_URL).origin}/post/${
            post.id
          }`,
        },
        title: post.title,
        content: `${this.getUserName(
          post.creator,
        )} created a new post${this.generateTopicsName(post)}`,
      };

      const createNotificationsDto: InternalCreateNotificationDto[] =
        uidsToNotify.map((uid) => ({
          recipient_id: uid,
          created_by: post.created_by,
          ...notificationBody,
        }));

      await this.createMultiple(createNotificationsDto);
      this.redisClient.publish(
        'notifications',
        JSON.stringify({
          event: 'notification:created',
          token: config.SOCKET_EVENT_SECRET,
          uids: uidsToNotify,
        }),
      );
      this.pushNotificationsService.push(uidsToNotify, notificationBody);
    } catch (error) {
      this.logger.error(
        'Error handling notifyPostCreated',
        JSON.stringify(error),
      );
    }
  }

  async notifyCommentCreated(postId: string, commentId: string) {
    try {
      const [post, comment, postSubscriptions] = await Promise.all([
        firstValueFrom<Post>(this.postsClient.send('post.find_by_id', postId)),
        firstValueFrom<Comment>(
          this.postsClient.send('comment.find_by_id', commentId),
        ),
        firstValueFrom<PostSubscription[]>(
          this.postsClient.send('post_subscription.find_by_post_id', postId),
        ),
      ]);

      this.redisClient.publish(
        'posts',
        JSON.stringify({
          event: 'comment:created',
          token: config.SOCKET_EVENT_SECRET,
          commentId,
          postId: post.id,
          creatorId: comment.creator.id,
        }),
      );

      const uidsToNotify = [];
      const createNotificationsDto: InternalCreateNotificationDto[] = [];
      const notificationMetaData = {
        action_url: `${new URL(config.CLIENT_BASE_URL).origin}/post/${post.id}`,
      };
      // Notify to owner of post
      if (post.created_by !== comment.created_by) {
        uidsToNotify.push(post.created_by);
        const notificationBody = {
          title: `${this.getUserName(comment.creator)} commented to your post`,
          content: comment.content,
          meta_data: notificationMetaData,
        };

        createNotificationsDto.push({
          recipient_id: post.created_by,
          created_by: comment.created_by,
          ...notificationBody,
        });

        this.pushNotificationsService.push([post.created_by], notificationBody);
      }

      // Notify to subscribers of post except the owner of post and comment
      const filteredSubscriptions = postSubscriptions.filter(
        (sub) => sub.uid !== post.created_by && sub.uid !== comment.created_by,
      );
      if (filteredSubscriptions.length) {
        const notificationBody = {
          title: `${this.getUserName(comment.creator)} commented to '${
            post.title
          }'`,
          content: comment.content,
          meta_data: notificationMetaData,
        };
        filteredSubscriptions.forEach((sub) => {
          createNotificationsDto.push({
            recipient_id: sub.uid,
            created_by: comment.created_by,
            ...notificationBody,
          });
          uidsToNotify.push(sub.uid);
        });
        this.pushNotificationsService.push(
          filteredSubscriptions.map((sub) => sub.uid),
          notificationBody,
        );
      }

      // Notify to owner of comment
      if (
        comment.parent_id &&
        comment.parent?.created_by &&
        comment.parent?.created_by !== comment.created_by
      ) {
        uidsToNotify.push(comment.parent.created_by);
        const notificationBody = {
          title: `${this.getUserName(comment.creator)} replied to your comment`,
          content: comment.content,
          meta_data: notificationMetaData,
        };
        createNotificationsDto.push({
          recipient_id: comment.parent.created_by,
          created_by: comment.created_by,
          ...notificationBody,
        });

        this.pushNotificationsService.push(
          [comment.parent?.created_by],
          notificationBody,
        );
      }

      await this.createMultiple(createNotificationsDto);
      this.redisClient.publish(
        'notifications',
        JSON.stringify({
          event: 'notification:created',
          token: config.SOCKET_EVENT_SECRET,
          uids: uidsToNotify,
        }),
      );
    } catch (error) {
      this.logger.error(
        'Error handling notifyCommentCreated',
        JSON.stringify(error),
      );
    }
  }

  async notifyCommentRemoved(
    postId: string,
    commentId: string,
    userId: string,
  ) {
    this.redisClient.publish(
      'posts',
      JSON.stringify({
        event: 'comment:removed',
        token: config.SOCKET_EVENT_SECRET,
        postId: postId,
        commentId: commentId,
        creatorId: userId,
      }),
    );
  }

  async notifyCommentUpdated(
    postId: string,
    commentId: string,
    userId: string,
  ) {
    this.redisClient.publish(
      'posts',
      JSON.stringify({
        event: 'comment:updated',
        token: config.SOCKET_EVENT_SECRET,
        postId: postId,
        commentId: commentId,
        creatorId: userId,
      }),
    );
  }

  async notifyUserFollowed(from_uid: string, to_uid: string) {
    try {
      const user = await firstValueFrom<User>(
        this.usersClient.send('user.find_by_id', from_uid),
      );
      const uidsToNotify = [to_uid];
      const notificationBody = {
        title: 'New Follower',
        content: `${this.getUserName(user)} followed you.`,
        meta_data: {
          action_url: `${new URL(config.CLIENT_BASE_URL).origin}/profile/${
            user.id
          }`,
        },
      };

      const createNotificationDto: InternalCreateNotificationDto = {
        recipient_id: to_uid,
        created_by: from_uid,
        ...notificationBody,
      };

      await this.create(createNotificationDto);
      this.redisClient.publish(
        'notifications',
        JSON.stringify({
          event: 'notification:created',
          token: config.SOCKET_EVENT_SECRET,
          uids: uidsToNotify,
        }),
      );
      this.pushNotificationsService.push(uidsToNotify, notificationBody);
    } catch (error) {
      this.logger.error(
        'Error handling notifyUserFollowed',
        JSON.stringify(error),
      );
    }
  }

  async notifyUserUnfollowed(from_uid: string, to_uid: string) {
    try {
      const user = await firstValueFrom<User>(
        this.usersClient.send('user.find_by_id', from_uid),
      );
      const uidsToNotify = [to_uid];
      const notificationBody = {
        title: 'Follower is leaving',
        content: `${this.getUserName(user)} unfollowed you.`,
        meta_data: {
          action_url: `${new URL(config.CLIENT_BASE_URL).origin}/profile/${
            user.id
          }`,
        },
      };

      const createNotificationDto: InternalCreateNotificationDto = {
        recipient_id: to_uid,
        created_by: from_uid,
        ...notificationBody,
      };

      await this.create(createNotificationDto);
      this.redisClient.publish(
        'notifications',
        JSON.stringify({
          event: 'notification:created',
          token: config.SOCKET_EVENT_SECRET,
          uids: uidsToNotify,
        }),
      );
      this.pushNotificationsService.push(uidsToNotify, notificationBody);
    } catch (error) {
      this.logger.error(
        'Error handling notifyUserUnfollowed',
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
    if (!user.first_name && !user.last_name) return `User ${user.id}`;
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

  async deleteAll(userId: string) {
    return await this.notificationsRepository.delete({ recipient_id: userId });
  }

  async findAll(userId: string, queryDto: QueryDto) {
    const findOptions: FindManyOptions<Notification> = {
      select: this.findOptionsSelect,
      skip: queryDto.offset,
      take: queryDto.limit,
      relations: (queryDto as any).relations ?? [],
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

  async countUnread(userId: string) {
    return await this.notificationsRepository.count({
      where: {
        recipient_id: userId,
        read: false,
      },
      select: { id: true },
    });
  }

  async findOne(userId: string, notificationId: string) {
    const res = await this.notificationsRepository.findOne({
      select: this.findOptionsSelect,
      where: {
        id: notificationId,
        recipient_id: userId,
      },
      relations: {
        creator: true,
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
