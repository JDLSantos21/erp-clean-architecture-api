import { JwtAdapter } from "../../../config/jwt";
import { RegisterUserDto } from "../../dtos";
import { CustomError } from "../../errors";
import { AuthRepository } from "../../repositories";

type User = {
  id: string;
  name: string;
  lastName: string;
  roles: string[];
};

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface IRegisterUserUseCase {
  execute(registerUserDto: RegisterUserDto): Promise<TokenResponse>;
}

export class RegisterUser implements IRegisterUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(registerUserDto: RegisterUserDto): Promise<TokenResponse> {
    await this.existsUser(registerUserDto.username);
    await this.verifyRoleExists(registerUserDto.roles);

    // crear usuario
    const user = await this.authRepository.register(registerUserDto);

    // Generar access token y refresh token
    const accessToken = await JwtAdapter.generateAccessToken({ id: user.id });
    const refreshToken = await JwtAdapter.generateRefreshToken({ id: user.id });

    if (!accessToken || !refreshToken) {
      throw CustomError.internalServer("Error al generar tokens ErrC:Ax01");
    }

    // Guardar refresh token en la base de datos
    await this.authRepository.saveRefreshToken(
      user.id,
      refreshToken,
      JwtAdapter.getRefreshTokenExpirationDate()
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.toString()),
      },
    };
  }

  private async existsUser(username: string): Promise<void> {
    const user = await this.authRepository.findUserByUsername(username);
    if (user) {
      throw CustomError.badRequest("User already exists");
    }
  }

  private async verifyRoleExists(roleIds: number[]): Promise<void> {
    const roles = await this.authRepository.findRolesByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw CustomError.badRequest("Some roles do not exist");
    }
  }
}
