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

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ILoginUserUseCase {
  execute(LoginUserDto: LoginUserDto): Promise<TokenResponse>;
}

export class LoginUser implements ILoginUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(loginUserDto: LoginUserDto): Promise<TokenResponse> {
    const user = await this.authRepository.login(loginUserDto);

    const { id, name, lastName, roles } = user;

    // Generar access token y refresh token
    const accessToken = await JwtAdapter.generateAccessToken({ id });
    const refreshToken = await JwtAdapter.generateRefreshToken({ id });

    if (!accessToken || !refreshToken) {
      throw CustomError.internalServer("Error al generar tokens ErrC:Ax01");
    }

    // Guardar refresh token en la base de datos
    await this.authRepository.saveRefreshToken(
      id,
      refreshToken,
      JwtAdapter.getRefreshTokenExpirationDate()
    );

    return {
      user: {
        id,
        lastName,
        name,
        roles: roles.map((role) => role),
      },
      accessToken,
      refreshToken,
    };
  }
}
