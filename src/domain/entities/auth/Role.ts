import Entity from "../entity";
import { RoleName } from "./User";

export class Role extends Entity<Role> {
  id!: number;
  name!: RoleName;
  hierarchyLevel!: number;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
