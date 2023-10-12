import { BaseEntity, User } from ".";
import { Entity, Column, Index, JoinColumn, ManyToOne } from "typeorm";

@Entity("notifications")
export class Notification extends BaseEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column({
    default: false,
  })
  read: boolean;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;

  @Index()
  @Column()
  recipient_id: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "recipient_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_notification_recipient_id",
  })
  recipient: User;
}
