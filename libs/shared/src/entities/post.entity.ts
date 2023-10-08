import { DefaultEntity } from ".";
import { Entity, Column, ManyToMany, RelationId, JoinTable } from "typeorm";
import { Topic } from "./topic.entity";

@Entity("posts")
export class Post extends DefaultEntity {
  @Column({
    length: 50,
  })
  title: string;

  @Column({
    type: "text",
  })
  content: string;

  @Column({
    type: "integer",
    nullable: true,
    default: 0,
  })
  upvotes: number;

  @Column({
    type: "integer",
    nullable: true,
    default: 0,
  })
  downvotes: number;

  @Column({
    type: "boolean",
  })
  publish: boolean;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;

  @ManyToMany((type) => Topic)
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

  @RelationId((post: Post) => post.topics)
  topicIds: string[];
}
