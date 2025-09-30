import {
  CreateEmployeeDto,
  EmployeeQueryDto,
  UpdateEmployeeDto,
} from "../dtos";
import { Employee } from "../entities/Employee";
import { FilterParams } from "../types";

export abstract class EmployeeDatasource {
  abstract createEmployee(employee: CreateEmployeeDto): Promise<Employee>;

  abstract findAll(
    params: FilterParams<EmployeeQueryDto>
  ): Promise<{ employees: Employee[]; total: number }>;

  abstract getEmployeeById(id: string): Promise<Employee | null>;

  abstract updateEmployee(
    id: string,
    employee: UpdateEmployeeDto
  ): Promise<Employee>;

  abstract deleteEmployee(id: string): Promise<void>;

  abstract findByCedula(cedula: string): Promise<Employee | null>;
  abstract findByEmployeeCode(employeeCode: string): Promise<Employee | null>;
  abstract findByPhoneNumber(phoneNumber: string): Promise<Employee | null>;
}
