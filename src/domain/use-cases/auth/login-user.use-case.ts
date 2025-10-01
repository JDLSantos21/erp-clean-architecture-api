import { JwtAdapter } from "../../../config/jwt";
import { LoginUserDto } from "../../dtos";
import { RoleName } from "../../entities";
import { CustomError } from "../../errors";
import { AuthRepository } from "../../repositories";

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

    const token = await this.signToken({ id }, TOKEN_DURATION_IN_MILISECONS);

    if (!token)
      throw CustomError.internalServer(
        "Ocurrio un error al generar el token ErrC:Ax01"
      );

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
