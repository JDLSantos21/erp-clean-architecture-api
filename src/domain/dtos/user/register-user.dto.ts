export class RegisterUserDto {
  private constructor(
    public username: string,
    public password: string,
    public name: string,
    public lastName: string,
    public roles: number[]
  ) {}

  static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const { username, password, name, lastName, roles } = object;

    if (!username || !password) {
      return ["Username and password are required", undefined];
    }

    if (!name || !lastName) {
      return ["Name and last name are required", undefined];
    }

    if (username.length < 4 || username.length > 20) {
      return ["Username must be between 4 and 20 characters", undefined];
    }

    if (password.length < 6 || password.length > 30) {
      return ["Password must be between 6 and 30 characters", undefined];
    }

    if (!roles) {
      return ["roles is required", undefined];
    }

    if (roles && !Array.isArray(roles)) {
      return ["Role must be an array", undefined];
    }

    if (roles.length === 0) {
      return ["Role must not be an empty array", undefined];
    }

    const uniqueRoles = Array.from(new Set(roles as number[]));

    return [
      undefined,
      new RegisterUserDto(username, password, name, lastName, uniqueRoles),
    ];
  }
}
