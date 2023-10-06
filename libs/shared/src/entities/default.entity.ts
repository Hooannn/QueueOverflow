import { PrimaryGeneratedColumn, Generated } from "typeorm";

export class DefaultEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Generated("increment")
  idx: number;
}
