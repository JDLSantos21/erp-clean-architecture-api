import { StatusCode } from "../../constants";
import { CustomError } from "../../errors/custom.errors";
import { AuthRepository } from "../../repositories/auth.repository";

interface SetRolesToUserUseCase {
  execute(userId: string, roles: number[]): Promise<void>;
}

export class SetRolesToUser implements SetRolesToUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userId: string, roles: number[]): Promise<void> {
    const existingRoles = await this.authRepository.findRolesByIds(roles);

    console.log("existingRoles", existingRoles);
    console.log("roles", roles);
    if (existingRoles.length !== roles.length)
      throw new CustomError(
        StatusCode.BAD_REQUEST,
        "Algunos de los roles proporcionados no existen"
      );

    const userRoles = await this.authRepository.getUserRoles(userId);
    const userRoleIds = userRoles.map((role) => role.id);

    const hasDuplicateRoles = roles.some((roleId) =>
      userRoleIds.includes(roleId)
    );

    if (hasDuplicateRoles)
      throw new CustomError(
        StatusCode.BAD_REQUEST,
        "El usuario ya tiene algunos de los roles proporcionados"
      );

    await this.authRepository.setRolesToUser(userId, roles);
  }
}
