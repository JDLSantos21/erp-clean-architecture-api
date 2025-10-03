import Entity from "../entity";

export type RoleName =
  | "ADMIN"
  | "ADMINISTRATIVO"
  | "CHOFER"
  | "SUPERVISOR"
  | "OPERADOR"
  | "USER";

export class User extends Entity<User> {
  id!: string;
  name!: string;
  lastName!: string;
  username!: string;
  password!: string;
  roles!: RoleName[];
  createdAt?: Date;
  updatedAt?: Date;
}
