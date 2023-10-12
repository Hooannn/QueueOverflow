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
import { CreateNotificationDto } from '@queueoverflow/shared/dtos';
import { firstValueFrom } from 'rxjs';
import { registerTemplate } from 'src/mailer/templates/password';
import { welcomeTemplate } from 'src/mailer/templates/welcome';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject('POSTS_SERVICE')
    private readonly postsClient: ClientProxy,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
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
    const post = await firstValueFrom<Post>(
      this.postsClient.send('post.find_by_id', postId),
    );

    if (!post.publish) return;
    const [...subs] = await Promise.all(
      post.topicIds.map((topicId) => this.findSubscriptionsByTopicId(topicId)),
    );

    const { data: followers } = await firstValueFrom<{
      data: Follow[];
      total?: number;
    }>(
      this.usersClient.send('user.find_followers', { userId: post.created_by }),
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

    uidsToNotify.forEach((uid) => {
      const createNotificationDto: CreateNotificationDto = {
        recipient_id: uid,
        title: 'New Post',
        content: `${this.getUserName(
          post.creator,
        )} created a new post with title ${post.title}${this.generateTopicsName(
          post,
        )}`,
      };

      this.create(createNotificationDto);
    });
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
}
