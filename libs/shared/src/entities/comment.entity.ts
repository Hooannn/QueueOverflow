import { BaseEntity, Post, CommentVote } from ".";
import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

@Entity("comments")
export class Comment extends BaseEntity {
  @Column({
    type: "text",
    nullable: true,
  })
  content?: string;

  @Column({
    type: "boolean",
    default: true,
  })
  is_root: boolean;

  @Column({
    type: "uuid",
    nullable: true,
  })
  parent_id?: string;

  @ManyToOne(() => Comment)
  @JoinColumn({
    name: "parent_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_comment_parent_id",
  })
  parent?: Comment;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;

  @OneToMany(
    () => CommentVote,
    (vote) => vote.comment,
    {
      cascade: true,
    }
  )
  @JoinColumn()
  votes: CommentVote[];

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
