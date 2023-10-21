import {
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum VoteType {
  Up,
  Down,
}

export abstract class Vote {
  @Column({
    type: "enum",
    enum: VoteType,
  })
  type: VoteType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Index()
  @PrimaryColumn({ type: "uuid" })
  uid: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "uid",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_vote_user_id",
  })
  creator: User;
}
