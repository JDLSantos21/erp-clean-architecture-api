import Entity from "./entity";

export class User extends Entity<User> {
  id!: string;
  name!: string;
  lastName!: string;
  username!: string;
  password!: string;
  roles!: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role extends Entity<Role> {
  id!: number;
  name!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserRole extends Entity<UserRole> {
  id!: number;
  userId!: string;
  roleId!: number;
  createdAt?: Date;
}
