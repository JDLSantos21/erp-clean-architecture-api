import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos";
import { Employee } from "../entities/Employee";

interface findAllParams {
  filters?: Partial<Employee>;
  skip?: number;
  limit?: number;
}

export abstract class EmployeeRepository {
  abstract findById(id: string): Promise<Employee | null>;
  abstract findAll({
    filters,
    skip,
    limit,
  }: findAllParams): Promise<{ employees: Employee[]; total: number }>;
  abstract create(employee: CreateEmployeeDto): Promise<Employee>;
  abstract update(
    id: string,
    employeeDto: UpdateEmployeeDto
  ): Promise<Employee>;
  abstract delete(id: string): Promise<void>;
  abstract findByCedula(cedula: string): Promise<Employee | null>;
  abstract findByEmployeeCode(employeeCode: string): Promise<Employee | null>;
  abstract findByPhoneNumber(phoneNumber: string): Promise<Employee | null>;
}
