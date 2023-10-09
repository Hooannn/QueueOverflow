import { BaseEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("follows")
export class Follow extends BaseEntity {
  @Column()
  from_uid: string;

  @Column()
  to_uid: string;
}
