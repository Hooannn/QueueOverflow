import { Comment } from ".";
import { Vote } from "./base.vote.entity";
import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity("comment_votes")
export class CommentVote extends Vote {
  @Index()
  @PrimaryColumn({ type: "uuid" })
  comment_id: string;

  @ManyToOne(
    () => Comment,
    (comment) => comment.votes,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }
  )
  @JoinColumn({
    name: "comment_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_vote_comment_id",
  })
  comment: Comment;
}
