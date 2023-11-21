import { Post, User } from ".";
import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("user_histories")
export class UserHistory {
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
    foreignKeyConstraintName: "fk_user_histories_user_id",
  })
  user: User;

  @ManyToOne(() => Post)
  @JoinColumn({
    name: "post_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_user_histories_post_id",
  })
  post: Post;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
