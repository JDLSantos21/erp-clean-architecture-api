export class ResetFuelTankDto {
  constructor(public userId: string, public password: string) {}

  static create(
    object: {
      [key: string]: any;
    },
    userId: string
  ): [string?, ResetFuelTankDto?] {
    const { password } = object;

    if (!userId || typeof userId !== "string" || userId.trim() === "")
      return ["El ID del usuario autenticado es obligatorio", undefined];

    if (!password || typeof password !== "string" || password.trim() === "")
      return ["La contraseña es obligatoria", undefined];

    return [undefined, new ResetFuelTankDto(userId, password)];
  }
}
