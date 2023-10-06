import { DefaultEntity } from ".";
import { Entity, Column } from "typeorm";

export enum Role {
  User = "user",
  Admin = "admin",
}

@Entity("users")
export class User extends DefaultEntity {
  @Column({
    length: 50,
    nullable: true,
  })
  first_name?: string;

  @Column({
    length: 50,
    nullable: true,
  })
  last_name?: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    type: "enum",
    enum: Role,
    array: true,
    default: [Role.User],
  })
  roles: Role[];

  @Column({
    nullable: true,
  })
  avatar?: string;

  @Column()
  password: string;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  meta_data: any;
}
