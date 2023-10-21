import { Vote } from "./base.vote.entity";
import { Post } from ".";
import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity("post_votes")
export class PostVote extends Vote {
  @Index()
  @PrimaryColumn({ type: "uuid" })
  post_id: string;

  @ManyToOne(
    () => Post,
    (post) => post.votes
  )
  @JoinColumn({
    name: "post_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_vote_post_id",
  })
  post: Post;
}
