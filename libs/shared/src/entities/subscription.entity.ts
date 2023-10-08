import { DefaultEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("subscriptions")
export class Subscription extends DefaultEntity {
  @Column()
  uid: string;

  @Column()
  topic_id: string;
}
