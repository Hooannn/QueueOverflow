import { BaseEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("comments")
export class Comment extends BaseEntity {
  @Column({
    type: "text",
    nullable: true,
  })
  content?: string;

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
