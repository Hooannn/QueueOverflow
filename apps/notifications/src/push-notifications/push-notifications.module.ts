import { Module } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import FCM_PROVIDER from './fcm.provider';
import { FcmToken } from '@queueoverflow/shared/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FcmToken])],
  exports: [PushNotificationsService],
  providers: [PushNotificationsService, FCM_PROVIDER],
})
export class PushNotificationsModule {}
