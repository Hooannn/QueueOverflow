import { Controller } from '@nestjs/common';
import { SearchService } from './search.service';
import { EventPattern } from '@nestjs/microservices';
import { Topic, Post, User } from '@queueoverflow/shared/entities';
import { PinoLogger } from 'nestjs-pino';
@Controller()
export class SyncController {
  constructor(
    private readonly searchService: SearchService,
    private readonly logger: PinoLogger,
  ) {}

  @EventPattern('topic.created')
  async onTopicsCreated(topics: Topic[]) {
    try {
      await this.searchService.indexingDocuments('topic', topics);
    } catch (error) {
      this.logger.error('Failed to index topics', JSON.stringify(error));
    }
  }

  @EventPattern('topic.updated')
  async onTopicUpdated(topic: Topic) {
    try {
      await this.searchService.updateDocument('topic', topic.id, topic);
    } catch (error) {
      this.logger.error('Failed to update topic', JSON.stringify(error));
    }
  }

  @EventPattern('topic.removed')
  async onTopicRemoved(topicId: string) {
    try {
      await this.searchService.deleteDocument('topic', topicId);
    } catch (error) {
      this.logger.error('Failed to remove topic', JSON.stringify(error));
    }
  }

  @EventPattern('post.created')
  async onPostsCreated(posts: Post[]) {
    try {
      await this.searchService.indexingDocuments('post', posts);
    } catch (error) {
      this.logger.error('Failed to index posts', JSON.stringify(error));
    }
  }

  @EventPattern('post.updated')
  async onPostUpdated(post: Post) {
    try {
      await this.searchService.updateDocument('post', post.id, post);
    } catch (error) {
      this.logger.error('Failed to update post', JSON.stringify(error));
    }
  }

  @EventPattern('post.removed')
  async onPostRemoved(postId: string) {
    try {
      await this.searchService.deleteDocument('post', postId);
    } catch (error) {
      this.logger.error('Failed to delete post', JSON.stringify(error));
    }
  }

  @EventPattern('user.created')
  async onUsersCreated(users: User[]) {
    try {
      await this.searchService.indexingDocuments('user', users);
    } catch (error) {
      this.logger.error('Failed to index users', JSON.stringify(error));
    }
  }

  @EventPattern('user.updated')
  async onUserUpdated(user: User) {
    try {
      await this.searchService.updateDocument('user', user.id, user);
    } catch (error) {
      this.logger.error('Failed to update user', JSON.stringify(error));
    }
  }

  @EventPattern('user.removed')
  async onUserRemoved(userId: string) {
    try {
      await this.searchService.deleteDocument('user', userId);
    } catch (error) {
      this.logger.error('Failed to remove user', JSON.stringify(error));
    }
  }
}
