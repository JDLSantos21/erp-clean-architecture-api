import {
  CreateEmployeeDto,
  Employee,
  EmployeeDatasource,
  EmployeeRepository,
} from "../../domain";

export class EmployeeRepositoryImpl implements EmployeeRepository {
  constructor(private readonly employeeDatasource: EmployeeDatasource) {}

  create(employee: CreateEmployeeDto): Promise<Employee> {
    return this.employeeDatasource.createEmployee(employee);
  }

  findAll({
    filters,
    skip,
    limit,
  }: {
    filters: Partial<Employee>;
    skip: number;
    limit: number;
  }): Promise<{ employees: Employee[]; total: number }> {
    return this.employeeDatasource.findAll({ filters, skip, limit });
  }

  delete(id: string): Promise<void> {
    return this.employeeDatasource.deleteEmployee(id);
  }

  update(id: string, data: CreateEmployeeDto): Promise<Employee> {
    return this.employeeDatasource.updateEmployee(id, data);
  }

  findById(id: string): Promise<Employee | null> {
    return this.employeeDatasource.getEmployeeById(id);
  }

  findByCedula(cedula: string): Promise<Employee | null> {
    return this.employeeDatasource.findByCedula(cedula);
  }

  findByEmployeeCode(employeeCode: string): Promise<Employee | null> {
    return this.employeeDatasource.findByEmployeeCode(employeeCode);
  }

  findByPhoneNumber(phoneNumber: string): Promise<Employee | null> {
    return this.employeeDatasource.findByPhoneNumber(phoneNumber);
  }
}
