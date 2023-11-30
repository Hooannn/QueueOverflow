import { BaseEntity, User } from ".";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("follows")
export class Follow {
  @Index()
  @PrimaryColumn({
    type: "uuid",
  })
  from_uid: string;

  @Index()
  @PrimaryColumn({
    type: "uuid",
  })
  to_uid: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "from_uid",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_from_user_id",
  })
  from_user: User;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "to_uid",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_to_user_id",
  })
  to_user: User;
}
