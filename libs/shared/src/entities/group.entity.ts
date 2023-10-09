import { BaseEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("groups")
export class Group extends BaseEntity {
  @Column({
    length: 50,
  })
  title: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description?: string;

  @Column({
    type: "boolean",
    default: false,
  })
  public: boolean;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;
}
