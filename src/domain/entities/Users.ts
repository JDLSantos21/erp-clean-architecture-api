import Entity from "./entity";

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

export type RoleName =
  | "ADMIN"
  | "ADMINISTRATIVO"
  | "CHOFER"
  | "SUPERVISOR"
  | "OPERADOR"
  | "USER";

export class Role extends Entity<Role> {
  id!: number;
  name!: RoleName;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserRole extends Entity<UserRole> {
  id!: number;
  userId!: string;
  roleId!: number;
  createdAt?: Date;
}
