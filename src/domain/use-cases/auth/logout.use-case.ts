import { CustomError } from "../../errors";
import { AuthRepository } from "../../repositories";

export interface ILogoutUseCase {
  execute(userId: string, refreshToken?: string): Promise<void>;
}

export class LogoutUseCase implements ILogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(userId: string, refreshToken?: string): Promise<void> {
    // Verificar que el usuario existe
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw CustomError.notFound("Usuario no encontrado");
    }

    if (refreshToken) {
      // Si se proporciona un refresh token, solo revocarlo
      const storedToken = await this.authRepository.findRefreshToken(
        refreshToken
      );

      if (storedToken && storedToken.userId === userId) {
        await this.authRepository.revokeRefreshToken(storedToken.id);
      }
    } else {
      // Si no se proporciona, revocar todos los tokens del usuario
      await this.authRepository.revokeAllUserTokens(userId);
    }
  }
}
