import { RevokeTokenDto } from "../../dtos";
import { CustomError } from "../../errors";
import { AuthRepository } from "../../repositories";

export interface IRevokeTokenUseCase {
  execute(revokeTokenDto: RevokeTokenDto): Promise<void>;
}

export class RevokeTokenUseCase implements IRevokeTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(revokeTokenDto: RevokeTokenDto): Promise<void> {
    // Verificar que el usuario existe
    const user = await this.authRepository.findById(revokeTokenDto.userId);

    if (!user) {
      throw CustomError.notFound("Usuario no encontrado");
    }

    if (revokeTokenDto.tokenId) {
      // Revocar un token específico
      await this.authRepository.revokeRefreshToken(revokeTokenDto.tokenId);
    } else {
      // Revocar todos los tokens del usuario
      await this.authRepository.revokeAllUserTokens(revokeTokenDto.userId);
    }
  }
}
