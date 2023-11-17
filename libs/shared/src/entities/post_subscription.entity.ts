import { User, Post } from ".";
import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("post_subscriptions")
export class PostSubscription {
  @Index()
  @PrimaryColumn()
  uid: string;

  @Index()
  @PrimaryColumn()
  post_id: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "uid",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_post_subscriptions_user_id",
  })
  user: User;

  @ManyToOne(() => Post)
  @JoinColumn({
    name: "post_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_post_subscriptions_post_id",
  })
  post: Post;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
