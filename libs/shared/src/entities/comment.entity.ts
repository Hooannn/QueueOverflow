import { DefaultEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("comments")
export class Comment extends DefaultEntity {
  @Column({
    type: "text",
    nullable: true,
  })
  content?: string;

  @Column({
    type: "boolean",
  })
  public: boolean;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;
}