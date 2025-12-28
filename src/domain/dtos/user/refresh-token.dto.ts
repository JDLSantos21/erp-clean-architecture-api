export class RefreshTokenDto {
  private constructor(public readonly refreshToken: string) {}

  static create(object: { [key: string]: any }): [string?, RefreshTokenDto?] {
    const { refresh_token } = object;

    if (!refresh_token) {
      return ["El refresh token es requerido"];
    }

    if (typeof refresh_token !== "string") {
      return ["El refresh token debe ser un string"];
    }

    return [undefined, new RefreshTokenDto(refresh_token)];
  }
}
