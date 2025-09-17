import { Validators } from "../../../config";

export class FuelAlertConfigDto {
  constructor(
    public lowFuelThreshold: number,
    public criticalFuelThreshold: number,
    public isActive: boolean = true
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, FuelAlertConfigDto?] {
    const { lowFuelThreshold, criticalFuelThreshold, isActive = true } = object;

    if (!lowFuelThreshold || lowFuelThreshold <= 0) {
      return ["Low fuel threshold must be a positive number"];
    }

    if (!criticalFuelThreshold || criticalFuelThreshold <= 0) {
      return ["Critical fuel threshold must be a positive number"];
    }

    if (criticalFuelThreshold >= lowFuelThreshold) {
      return ["Critical threshold must be lower than low fuel threshold"];
    }

    return [
      undefined,
      new FuelAlertConfigDto(lowFuelThreshold, criticalFuelThreshold, isActive),
    ];
  }
}
