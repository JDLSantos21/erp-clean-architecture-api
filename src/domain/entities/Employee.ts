import Entity from "./entity";

export class Employee extends Entity<Employee> {
  id!: string;
  userId?: string | null;
  employeeCode!: string;
  name!: string;
  lastName!: string;
  position!: string;
  phoneNumber?: string | null;
  cedula?: string | null;
  licenseExpirationDate?: Date | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
