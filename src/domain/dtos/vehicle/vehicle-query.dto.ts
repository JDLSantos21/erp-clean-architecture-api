export class VehicleQueryDto {
  constructor(
    public page: number,
    public limit: number,
    public licensePlate?: string,
    public chasis?: string,
    public brand?: string,
    public model?: string,
    public year?: number,
    public currentTag?: string,
    public search?: string
  ) {}

  static create(queryParams: {
    [key: string]: any;
  }): [string?, VehicleQueryDto?] {
    const {
      search,
      chasis,
      license_plate,
      brand,
      model,
      year,
      current_tag,
      page,
      limit,
    } = queryParams;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const yearNum = Number(year);

    if (isNaN(pageNum) || pageNum < 1) {
      return ["Invalid page number", undefined];
    }

    if (isNaN(limitNum) || limitNum < 1) {
      return ["Invalid limit number", undefined];
    }

    if (year && year.toString().length !== 4) {
      return ["Invalid year", undefined];
    }

    return [
      undefined,
      new VehicleQueryDto(
        pageNum,
        limitNum,
        license_plate?.trim(),
        chasis?.trim(),
        brand?.trim(),
        model?.trim(),
        yearNum || undefined,
        current_tag?.trim(),
        search?.trim()
      ),
    ];
  }
}
