import { Validators } from "../../../config";

export class UpdateFuelConsumptionDto {
  constructor(
    public mileage?: number,
    public tankRefillId?: number,
    public notes?: string,
    public consumedAt?: Date
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, UpdateFuelConsumptionDto?] {
    const { mileage, notes, consumed_at, tank_refill_id } = object;

    const hasAtLeastOneField = Validators.hasAtLeastOneField({
      mileage,
      notes,
      consumed_at,
      tank_refill_id,
    });

    if (!hasAtLeastOneField) {
      return ["Debe proporcionar al menos un campo para actualizar", undefined];
    }

    if (mileage !== undefined) {
      if (typeof mileage !== "number" || mileage <= 0) {
        return ["El kilometraje debe ser un número positivo", undefined];
      }
    }

    if (tank_refill_id !== undefined) {
      if (isNaN(tank_refill_id) || tank_refill_id <= 0) {
        return ["El ID de recarga de tanque no es válido", undefined];
      }
    }

    if (consumed_at !== undefined) {
      const date = new Date(consumed_at);
      if (isNaN(date.getTime())) {
        return ["La fecha de consumo no es válida", undefined];
      }

      if (date > new Date()) {
        return [
          "La fecha de consumo no puede ser mayor a la fecha actual",
          undefined,
        ];
      }
    }

    if (notes !== undefined) {
      if (typeof notes !== "string")
        return ["Las notas deben ser una cadena de texto", undefined];
      if (notes.trim() === "")
        return ["Las notas no pueden estar vacías", undefined];
      if (notes.length > 500)
        return ["Las notas no pueden exceder los 500 caracteres", undefined];
    }

    return [
      undefined,
      new UpdateFuelConsumptionDto(
        mileage,
        tank_refill_id,
        notes,
        new Date(consumed_at)
      ),
    ];
  }
}
