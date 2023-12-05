import { BaseEntity, Comment, PostVote, Topic, UserHistory } from ".";
import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
} from "typeorm";

export enum PostType {
  Post = "post",
  Media = "media",
  Poll = "poll",
}
@Entity("posts")
export class Post extends BaseEntity {
  @Column({
    type: "text",
  })
  title: string;

  @Column({
    type: "text",
  })
  content: string;

  @Column({
    type: "enum",
    enum: PostType,
  })
  type: PostType;

  @Column({
    type: "text",
    array: true,
    nullable: true,
  })
  tags?: string[];

  @Column({
    type: "boolean",
    default: false,
  })
  publish: boolean;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;

  @OneToMany(
    () => PostVote,
    (vote) => vote.post,
    { cascade: true }
  )
  @JoinColumn()
  votes: PostVote[];

  @OneToMany(
    () => Comment,
    (comment) => comment.post,
    { cascade: true }
  )
  @JoinColumn()
  comments: Comment[];

  @ManyToMany(() => Topic, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinTable({
    name: "posts_topics",
    joinColumn: {
      name: "post_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "topic_id",
      referencedColumnName: "id",
    },
  })
  topics: Topic[];
}
