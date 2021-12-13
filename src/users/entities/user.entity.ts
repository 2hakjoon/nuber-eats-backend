import { Column, Entity } from "typeorm";

type UserRole = "client" | "owner" | "delivery";

@Entity()
export class User {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}
