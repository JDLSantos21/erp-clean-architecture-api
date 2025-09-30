import Entity from "./entity";

export type EmployeePosition =
  | "CHOFER"
  | "CAJERO"
  | "OPERADOR"
  | "SUPERVISOR"
  | "ADMINISTRACION";

export class Employee extends Entity<Employee> {
  id!: string;
  userId?: string | null;
  employeeCode!: string;
  name!: string;
  lastName!: string;
  position!: EmployeePosition;
  phoneNumber?: string | null;
  cedula?: string | null;
  licenseExpirationDate?: Date | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
