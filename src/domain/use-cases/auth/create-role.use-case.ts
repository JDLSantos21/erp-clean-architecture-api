import { CreateRoleDto } from "../../dtos";
import { Role } from "../../entities";
import { CustomError } from "../../errors";
import { AuthRepository } from "../../repositories";

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
