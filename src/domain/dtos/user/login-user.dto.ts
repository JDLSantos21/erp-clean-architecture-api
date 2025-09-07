export class LoginUserDto {
  constructor(public username: string, public password: string) {}

  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { username, password } = object;

    if (!username) return ["Missing username", undefined];
    if (username.length < 4) return ["Username too short", undefined];
    if (!password) return ["Missing password", undefined];
    if (password.length < 4) return ["Password too short", undefined];

    return [undefined, new LoginUserDto(username, password)];
  }
}
