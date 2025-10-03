export class FuelTankRefillByIdDto {
  constructor(public id: number, public consumptions?: boolean) {}

  static create(
    object: { [key: string]: any },
    consumptions?: any
  ): [string?, FuelTankRefillByIdDto?] {
    const { id } = object;

    if (!id) return ["El ID es obligatorio", undefined];

    const refill_id = Number(id);

    if (isNaN(id)) return ["El ID proporcionado no es válido", undefined];

    if (consumptions !== undefined) {
      const consumptionsBool = String(consumptions).toLowerCase();
      if (consumptionsBool !== "true" && consumptionsBool !== "false") {
        return ["El valor de consumptions debe ser true o false", undefined];
      }
    }

    return [
      undefined,
      new FuelTankRefillByIdDto(refill_id, Boolean(consumptions)),
    ];
  }
}
