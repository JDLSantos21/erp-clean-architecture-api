export class RevokeTokenDto {
  private constructor(
    public readonly userId: string,
    public readonly tokenId?: number
  ) {}

  static create(object: { [key: string]: any }): [string?, RevokeTokenDto?] {
    const { userId, tokenId } = object;

    if (!userId) {
      return ["El userId es requerido"];
    }

    if (typeof userId !== "string") {
      return ["El userId debe ser un string"];
    }

    if (tokenId !== undefined && typeof tokenId !== "number") {
      return ["El tokenId debe ser un número"];
    }

    return [undefined, new RevokeTokenDto(userId, tokenId)];
  }
}
