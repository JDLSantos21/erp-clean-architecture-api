import { JwtAdapter } from "../../../config/jwt";
import { RefreshTokenDto } from "../../dtos";
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

export interface IRefreshTokenUseCase {
  execute(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse>;
}

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    // Verificar que el refresh token es válido
    const payload = await JwtAdapter.validateToken<{ id: string }>(
      refreshTokenDto.refreshToken
    );

    if (!payload) {
      throw CustomError.unauthorized("Refresh token inválido o expirado");
    }

    // Buscar el token en la base de datos
    const storedToken = await this.authRepository.findRefreshToken(
      refreshTokenDto.refreshToken
    );

    if (!storedToken) {
      throw CustomError.unauthorized("Refresh token no encontrado");
    }

    // Verificar que el token no esté revocado
    if (storedToken.revoked) {
      throw CustomError.unauthorized("Refresh token revocado");
    }

    // Verificar que el token no haya expirado
    if (storedToken.isExpired) {
      throw CustomError.unauthorized("Refresh token expirado");
    }

    // Obtener el usuario
    const user = await this.authRepository.findById(payload.id);

    if (!user) {
      throw CustomError.notFound("Usuario no encontrado");
    }

    // Generar nuevos tokens
    const accessToken = await JwtAdapter.generateAccessToken({ id: user.id });
    const newRefreshToken = await JwtAdapter.generateRefreshToken({
      id: user.id,
    });

    if (!accessToken || !newRefreshToken) {
      throw CustomError.internalServer(
        "Error al generar nuevos tokens ErrC:RT01"
      );
    }

    // Revocar el token anterior
    await this.authRepository.revokeRefreshToken(storedToken.id);

    // Guardar el nuevo refresh token
    await this.authRepository.saveRefreshToken(
      user.id,
      newRefreshToken,
      JwtAdapter.getRefreshTokenExpirationDate(),
      storedToken.deviceInfo || undefined
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }
}
