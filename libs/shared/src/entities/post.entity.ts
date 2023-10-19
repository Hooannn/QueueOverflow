import { BaseEntity, Comment, Vote } from ".";
import {
  Entity,
  Column,
  ManyToMany,
  RelationId,
  JoinTable,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Topic } from "./topic.entity";

@Entity("posts")
export class Post extends BaseEntity {
  @Column({
    length: 50,
  })
  title: string;

  @Column({
    type: "text",
  })
  content: string;

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
    () => Vote,
    (vote) => vote.post
  )
  @JoinColumn()
  votes: Vote[];

  @OneToMany(
    () => Comment,
    (comment) => comment.post
  )
  @JoinColumn()
  comments: Comment[];

  @ManyToMany(() => Topic)
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
