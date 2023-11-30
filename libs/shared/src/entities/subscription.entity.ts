import { Topic, User } from ".";
import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("subscriptions")
export class Subscription {
  @Index()
  @PrimaryColumn()
  uid: string;

  @Index()
  @PrimaryColumn()
  topic_id: string;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "uid",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_subscriptions_user_id",
  })
  user: User;

  @ManyToOne(() => Topic, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "topic_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_subscriptions_topic_id",
  })
  topic: Topic;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
