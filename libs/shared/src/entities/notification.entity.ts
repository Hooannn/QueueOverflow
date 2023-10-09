import { BaseEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("notifications")
export class Notification extends BaseEntity {
  @Column()
  title: string;
}
