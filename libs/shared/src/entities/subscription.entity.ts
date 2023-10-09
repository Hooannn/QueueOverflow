import { BaseEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("subscriptions")
export class Subscription extends BaseEntity {
  @Column()
  uid: string;

  @Column()
  topic_id: string;
}
