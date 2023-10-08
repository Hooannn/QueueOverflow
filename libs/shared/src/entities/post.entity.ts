import { DefaultEntity } from ".";
import { Entity, Column } from "typeorm";

@Entity("posts")
export class Post extends DefaultEntity {
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
  })
  public: boolean;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data?: any;
}
