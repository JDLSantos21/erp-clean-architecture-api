import { CreateEmployeeDto } from "../../dtos";
import { Employee } from "../../entities";
import { EmployeeRepository } from "../../repositories";
import { EmployeeService } from "../../services";

interface CreateEmployeeUseCase {
  execute(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
}

export class CreateEmployee implements CreateEmployeeUseCase {
  private readonly employeeService: EmployeeService;
  constructor(private readonly employeeRepository: EmployeeRepository) {
    this.employeeService = new EmployeeService(employeeRepository);
  }

  async execute(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const { phoneNumber, cedula, employeeCode } = createEmployeeDto;

    if (phoneNumber)
      await this.employeeService.validatePhoneNumberExists(phoneNumber);
    if (cedula) await this.employeeService.validateCedulaExists(cedula);
    if (employeeCode)
      await this.employeeService.validateEmployeeCodeExists(employeeCode);

    return await this.employeeRepository.create(createEmployeeDto);
  }
}
