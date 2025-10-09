import { PrismaClient } from "@prisma/client";
import {
  CreateEmployeeDto,
  CustomError,
  Employee,
  EmployeeDatasource,
  EmployeeQueryDto,
  FilterParams,
} from "../../domain";
import { buildWhere } from "../mappers/prisma-where.mapper";

export class EmployeeDatasourceImpl extends EmployeeDatasource {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }
  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    try {
      const registeredEmployee = await this.prisma.employee.create({ data });
      return new Employee(registeredEmployee);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    const employeeExist = await this.getEmployeeById(id);

    if (!employeeExist) throw CustomError.notFound("Este empleado no existe");

    try {
      await this.prisma.employee.delete({ where: { id } });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async findAll({
    filters,
    skip,
    limit,
  }: FilterParams<EmployeeQueryDto>): Promise<{
    employees: Employee[];
    total: number;
  }> {
    const where = buildWhere(filters!, [
      "name",
      "lastName",
      "employeeCode",
      "position",
      "cedula",
      "phoneNumber",
    ]);

    try {
      const [employees, total] = await Promise.all([
        await this.prisma.employee.findMany({
          where,
          skip,
          take: limit,
        }),
        await this.prisma.employee.count({ where }),
      ]);

      return { employees: employees.map((emp) => new Employee(emp)), total };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const employee = await this.prisma.employee.findUnique({ where: { id } });
      return employee ? new Employee(employee) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async updateEmployee(id: string, data: CreateEmployeeDto): Promise<Employee> {
    try {
      const updatedEmployee = await this.prisma.employee.update({
        where: { id },
        data,
      });
      return new Employee(updatedEmployee);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async findByCedula(cedula: string): Promise<Employee | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { cedula },
      });
      return employee ? new Employee(employee) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async findByEmployeeCode(employeeCode: string): Promise<Employee | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { employeeCode },
      });
      return employee ? new Employee(employee) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(
        "Fallo al buscar por código de empleado"
      );
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Employee | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { phoneNumber },
      });
      return employee ? new Employee(employee) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }
}
