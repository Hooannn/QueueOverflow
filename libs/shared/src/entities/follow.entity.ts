import { DefaultEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("follows")
export class Follow extends DefaultEntity {
  @Column()
  from_uid: string;

  @Column()
  to_uid: string;
}
