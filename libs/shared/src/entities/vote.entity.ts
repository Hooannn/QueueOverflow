import { Post, User } from ".";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export enum VoteType {
  Up,
  Down,
}

@Entity("votes")
export class Vote {
  @Index()
  @PrimaryColumn({ type: "uuid" })
  uid: string;

  @Index()
  @PrimaryColumn({ type: "uuid" })
  post_id: string;

  @Column({
    type: "enum",
    enum: VoteType,
  })
  type: VoteType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "uid",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_vote_user_id",
  })
  creator: User;

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
