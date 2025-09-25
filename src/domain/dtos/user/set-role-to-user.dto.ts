import { Validators } from "../../../config";

export class SetRolesToUserDto {
  private constructor(public roleIds: number[], public userId: string) {}

  static create(
    roleIds: number[],
    userId: string
  ): [string?, SetRolesToUserDto?] {
    if (!userId) return ["El ID de usuario es requerido", undefined];
    if (!roleIds) return ["El arreglo de roles es requerido", undefined];

    if (!Validators.uuid.test(userId))
      return ["El ID de usuario no es válido", undefined];

    if (
      !Array.isArray(roleIds) ||
      roleIds.some((id) => typeof id !== "number")
    ) {
      return ["El formato de roles es inválido", undefined];
    }

    if (roleIds.length === 0)
      return ["El arreglo de roles no debe estar vacío", undefined];

    const uniqueRoleIds = Array.from(new Set(roleIds)); //quitar duplicados con Set

    return [undefined, new SetRolesToUserDto(uniqueRoleIds, userId)];
  }
}
