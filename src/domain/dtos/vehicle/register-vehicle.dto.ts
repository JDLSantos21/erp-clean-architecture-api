export class RegisterVehicleDto {
  constructor(
    public licensePlate: string,
    public chasis: string,
    public brand: string,
    public model: string,
    public year: number,
    public currentTag: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, RegisterVehicleDto?] {
    const { chasis, license_plate, brand, model, year, current_tag } = object;

    console.log(object);

    if (
      !license_plate ||
      !chasis ||
      !brand ||
      !model ||
      !year ||
      !current_tag
    ) {
      return ["Faltan campos requeridos", undefined];
    }

    if (typeof year !== "number" || year.toString().length !== 4) {
      return ["Año inválido", undefined];
    }

    return [
      undefined,
      new RegisterVehicleDto(
        license_plate,
        chasis,
        brand,
        model,
        year,
        current_tag
      ),
    ];
  }
}
