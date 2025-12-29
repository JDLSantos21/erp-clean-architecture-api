import { RefreshToken } from "../../domain/entities";

export class RefreshTokenMapper {
  static toEntity(object: {
    id: number;
    userId: string;
    token: string;
    expiresAt: Date;
    revoked: boolean;
    revokedAt: Date | null;
    deviceInfo: any;
    createdAt: Date;
    updatedAt: Date;
  }): RefreshToken {
    return new RefreshToken(
      object.id,
      object.userId,
      object.token,
      object.expiresAt,
      object.revoked,
      object.revokedAt,
      object.deviceInfo,
      object.createdAt,
      object.updatedAt
    );
  }
}
