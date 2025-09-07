export class CreateRoleDto {
  private constructor(public role: string) {}

  static create(role_name: string): [string?, CreateRoleDto?] {
    console.log("DTO", role_name);

    if (!role_name) {
      return ["Missing role_name field", undefined];
    }

    return [undefined, new CreateRoleDto(role_name)];
  }
}
