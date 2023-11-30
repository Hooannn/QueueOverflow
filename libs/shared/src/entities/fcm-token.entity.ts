import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  Column,
} from "typeorm";
import { User } from ".";

@Entity("fcm_tokens")
export class FcmToken {
  @PrimaryColumn({ type: "uuid" })
  uid: string;

  @Column({
    nullable: true,
    type: "text",
  })
  web?: string;

  @Column({
    nullable: true,
    type: "text",
  })
  android?: string;

  @Column({
    nullable: true,
    type: "text",
  })
  ios?: string;

  @OneToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "uid",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_fcm_tokens_owner_id",
  })
  owner: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
