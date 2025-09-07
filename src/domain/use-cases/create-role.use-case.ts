import { AuthRepository } from "../repositories/auth.repository";
import { CustomError } from "../errors/custom.errors";
import { CreateRoleDto } from "../dtos/user/create-role.dto";
import { Role } from "../entities/Users";

interface CreateRoleUseCase {
  execute(createRoleDto: CreateRoleDto): Promise<Role>;
}

export class CreateRole implements CreateRoleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = await this.authRepository.createRole(createRoleDto);
    if (!role)
      throw CustomError.internalServer("Error creating role ErrC:Ax01");
    return role;
  }
}
