import { VehicleRepository } from "../repositories";
import { CustomError } from "../errors";

export class VehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async validateUniqueConstraints(
    dto: { licensePlate: string; chasis: string; currentTag: string },
    excludeId?: string
  ): Promise<void> {
    const { licensePlate, chasis, currentTag } = dto;

    const [existingByPlate, existingByChasis, existingByTag] =
      await Promise.all([
        this.vehicleRepository.findByLicensePlate(licensePlate),
        this.vehicleRepository.findByChasis(chasis),
        this.vehicleRepository.findByCurrentTag(currentTag),
      ]);

    const errors: string[] = [];

    if (existingByPlate && existingByPlate.id !== excludeId) {
      errors.push(`License plate '${licensePlate}' already exists`);
    }
    if (existingByChasis && existingByChasis.id !== excludeId) {
      errors.push(`Chasis '${chasis}' already exists`);
    }
    if (existingByTag && existingByTag.id !== excludeId) {
      errors.push(`Tag '${currentTag}' is already in use`);
    }

    if (errors.length > 0) {
      throw CustomError.conflict(errors.join(", "));
    }
  }

  async validateVehicleExists(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.getVehicleById(id);
    if (!vehicle) {
      throw CustomError.notFound("Vehicle not found");
    }
  }

  validateVehicleYear(year: number): void {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;

    if (year < minYear || year > currentYear + 1) {
      throw CustomError.badRequest(
        `Vehicle year must be between ${minYear} and ${currentYear + 1}`
      );
    }
  }
}
