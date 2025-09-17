import AUTH_CONSTANTS from "../../constants/auth.contants";
import { RoleName } from "../../entities/Users";

export class CreateRoleDto {
  private constructor(public role: RoleName) {}

  static create(role_name: RoleName): [string?, CreateRoleDto?] {
    if (!role_name) {
      return ["Nombre de rol es requerido", undefined];
    }

    if (!AUTH_CONSTANTS.ROLES.includes(role_name)) {
      return ["Nombre de rol inválido", undefined];
    }

    return [undefined, new CreateRoleDto(role_name)];
  }
}
