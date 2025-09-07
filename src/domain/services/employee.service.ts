import { Employee } from "../entities/Employee";
import { CustomError } from "../errors/custom.errors";
import { EmployeeRepository } from "../repositories/employee.repository";

export class EmployeeService {
  private readonly excludeId: string | undefined;
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async validateUniqueConstraints(
    dto: Partial<Employee>,
    excludeId?: string
  ): Promise<void> {
    const { phoneNumber, cedula, employeeCode } = dto;

    const promises: Promise<Employee | null>[] = [];

    if (cedula) promises.push(this.employeeRepository.findByCedula(cedula));
    if (employeeCode)
      promises.push(this.employeeRepository.findByEmployeeCode(employeeCode));
    if (phoneNumber)
      promises.push(this.employeeRepository.findByPhoneNumber(phoneNumber));

    const [cedulaExists, employeeCodeExists, phoneNumberExists] =
      await Promise.all(promises);

    const errors: string[] = [];

    if (cedulaExists && cedulaExists.id !== excludeId) errors.push("cédula");
    if (employeeCodeExists && employeeCodeExists.id !== excludeId)
      errors.push("código de empleado");
    if (phoneNumberExists && phoneNumberExists.id !== excludeId)
      errors.push("teléfono");

    let errorMessage: string = `Estos datos: (${errors.join(", ")}) ya existen`;

    if (errors.length > 0) throw CustomError.conflict(errorMessage);
  }

  async validateCedulaExists(cedula: string): Promise<void> {
    const employee = await this.employeeRepository.findByCedula(cedula);
    if (employee && employee.id !== this.excludeId)
      throw CustomError.conflict("Employee with this cedula already exists");
  }

  async validateEmployeeCodeExists(employeeCode: string): Promise<void> {
    const employee = await this.employeeRepository.findByEmployeeCode(
      employeeCode
    );
    if (employee && employee.id !== this.excludeId)
      throw CustomError.conflict(
        "Employee with this employee code already exists"
      );
  }

  async validatePhoneNumberExists(phoneNumber: string): Promise<void> {
    const employee = await this.employeeRepository.findByPhoneNumber(
      phoneNumber
    );
    if (employee && employee.id !== this.excludeId)
      throw CustomError.conflict(
        "Employee with this phone number already exists"
      );
  }
}
