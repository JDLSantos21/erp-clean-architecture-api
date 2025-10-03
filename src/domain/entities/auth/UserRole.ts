import Entity from "../entity";

export class UserRole extends Entity<UserRole> {
  id!: number;
  userId!: string;
  roleId!: number;
  createdAt?: Date;
}
