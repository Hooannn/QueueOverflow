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

@Entity("saved_posts")
export class SavedPost {
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
    foreignKeyConstraintName: "fk_saved_post_user_id",
  })
  user: User;

  @ManyToOne(() => Post)
  @JoinColumn({
    name: "post_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_saved_post_post_id",
  })
  post: Post;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
