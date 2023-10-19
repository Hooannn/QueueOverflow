import { BaseEntity, Post } from ".";
import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";

@Entity("comments")
export class Comment extends BaseEntity {
  @Column({
    type: "text",
    nullable: true,
  })
  content?: string;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;

  @Index()
  @Column({ type: "uuid" })
  post_id: string;

  @ManyToOne(
    () => Post,
    (post) => post.comments
  )
  @JoinColumn({
    name: "post_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_comment_post_id",
  })
  post: Post;
}
