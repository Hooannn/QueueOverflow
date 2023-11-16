import { Module } from '@nestjs/common';
import { SavedPostsService } from './saved_posts.service';
import { SavedPostsController } from './saved_posts.controller';
import { SavedPost } from '@queueoverflow/shared/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SavedPost])],
  controllers: [SavedPostsController],
  providers: [SavedPostsService],
})
export class SavedPostsModule {}
