import { JwtAdapter } from "../../config/jwt";
import { LoginUserDto } from "../dtos/user/login-user.dto";
import { RoleName } from "../entities/Users";
import { CustomError } from "../errors/custom.errors";
import { AuthRepository } from "../repositories/auth.repository";

type User = {
  id: string;
  name: string;
  lastName: string;
  roles: RoleName[];
};

interface UserToken {
  token: string;
  user: User;
}

type signToken = (payload: Object, duration?: number) => Promise<string | null>;

interface LoginUserUseCase {
  execute(LoginUserDto: LoginUserDto): Promise<UserToken>;
}

export class LoginUser implements LoginUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly signToken: signToken = JwtAdapter.generateToken
  ) {}

  async execute(loginUserDto: LoginUserDto): Promise<UserToken> {
    const TOKEN_DURATION_IN_MILISECONS = 7200;

    const user = await this.authRepository.login(loginUserDto);
    const { id, name, lastName, roles } = user;

    console.log(user);
    console.log(roles);

    const token = await this.signToken({ id }, TOKEN_DURATION_IN_MILISECONS);

    console.log(token);
    if (!token)
      throw CustomError.internalServer("Error register user ErrC:Ax01");

    return {
      user: {
        id,
        lastName,
        name,
        roles: roles.map((role) => role),
      },
      token,
    };
  }
}
