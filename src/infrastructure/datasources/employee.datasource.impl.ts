import { prisma } from "../../data/postgresql";
import {
  CreateEmployeeDto,
  CustomError,
  Employee,
  EmployeeDatasource,
} from "../../domain";
import { buildWhere } from "../mappers/prisma-where.mapper";

export class EmployeeDatasourceImpl extends EmployeeDatasource {
  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    try {
      const registeredEmployee = await prisma.employee.create({ data });
      return new Employee(registeredEmployee);
    } catch (error) {
      console.log(error);
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
      await prisma.employee.delete({ where: { id } });
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
  }: {
    filters?: Partial<Employee>;
    skip: number;
    limit: number;
  }): Promise<{ employees: Employee[]; total: number }> {
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
        await prisma.employee.findMany({
          where,
          skip,
          take: limit,
        }),
        await prisma.employee.count({ where }),
      ]);

      return { employees, total };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const employee = await prisma.employee.findUnique({ where: { id } });
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
      const updatedEmployee = await prisma.employee.update({
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
      const employee = await prisma.employee.findUnique({
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
      const employee = await prisma.employee.findUnique({
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
      const employee = await prisma.employee.findUnique({
        where: { phoneNumber },
      });
      return employee ? new Employee(employee) : null;
    } catch (error) {
      console.log("Aqui eh la vaina: ", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }
}
