import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateFcmTokenDto,
  UpdateFcmTokenDto,
} from '@queueoverflow/shared/dtos';
import { FcmToken } from '@queueoverflow/shared/entities';
import type { Message, Messaging } from 'firebase-admin/messaging';
import { Repository } from 'typeorm';
@Injectable()
export class PushNotificationsService {
  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokensRepository: Repository<FcmToken>,
    @Inject('FCM_CLIENT')
    private readonly messagingClient: Messaging,
  ) {}

  async findFcmTokens(userIds: string[]) {
    return await this.fcmTokensRepository.find({
      where: userIds.map((uid) => ({ uid })),
    });
  }

  async findFcmToken(userId: string) {
    return await this.fcmTokensRepository.findOne({ where: { uid: userId } });
  }

  async createFcmToken(userId: string, createFcmTokenDto: CreateFcmTokenDto) {
    const existingToken = await this.findFcmToken(userId);

    if (existingToken)
      return await this.updateFcmToken(userId, createFcmTokenDto);

    const fcmToken = this.fcmTokensRepository.create({
      uid: userId,
      ...createFcmTokenDto,
    });

    return await this.fcmTokensRepository.save(fcmToken);
  }

  async updateFcmToken(userId: string, updateFcmTokenDto: UpdateFcmTokenDto) {
    await this.fcmTokensRepository.update({ uid: userId }, updateFcmTokenDto);
    return await this.findFcmToken(userId);
  }

  async push(
    uids: string[],
    notificationPayload: { title: string; content: string },
  ) {
    const fcmTokens = await this.findFcmTokens(uids);

    const combinedTokens = fcmTokens.reduce((prev, current) => {
      const res = Object.keys(current)
        .filter((key) => ['web', 'android', 'ios'].includes(key))
        .map((key) => current[key])
        .filter((e) => e);
      return [...prev, ...res];
    }, []) as string[];

    const messages: Message[] = combinedTokens.map((token) => ({
      notification: {
        title: notificationPayload.title,
        body: notificationPayload.content,
      },
      token,
    }));

    return await this.messagingClient.sendEach(messages);
  }
}
