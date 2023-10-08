import { DefaultEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("notifications")
export class Notification extends DefaultEntity {
  @Column()
  title: string;
}
