import { UpdateEmployeeDto } from "../../dtos";
import { Employee } from "../../entities";
import { CustomError } from "../../errors";
import { EmployeeRepository } from "../../repositories";
import { EmployeeService } from "../../services";

interface UpdateEmployeeUseCaseI {
  execute(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>;
}

export class UpdateEmployeeUseCase implements UpdateEmployeeUseCaseI {
  private readonly employeeService: EmployeeService;

  constructor(private readonly employeeRepository: EmployeeRepository) {
    this.employeeService = new EmployeeService(employeeRepository);
  }

  async execute(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.findById(id);

    if (!existingEmployee) throw CustomError.notFound("Este usuario no existe");

    await this.employeeService.validateUniqueConstraints(dto, id);

    return this.employeeRepository.update(id, dto);
  }
}
