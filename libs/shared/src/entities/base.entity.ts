import {
  PrimaryGeneratedColumn,
  Generated,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Generated("increment")
  @Column()
  idx: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Index()
  @Column({
    nullable: true,
  })
  created_by?: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "created_by",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_creator_id",
  })
  creator: User;
}
