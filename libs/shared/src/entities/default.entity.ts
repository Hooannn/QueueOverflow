import {
  PrimaryGeneratedColumn,
  Generated,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export class DefaultEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Generated("increment")
  idx: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
