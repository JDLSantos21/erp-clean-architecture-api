import { CreateUpdateFuelTankDto } from "../../dtos";
import { FuelTank } from "../../entities/Fuel";
import { FuelRepository } from "../../repositories/fuel.repository";

interface CreateUpdateFuelTankUseCaseI {
  execute(params: CreateUpdateFuelTankDto): Promise<FuelTank>;
}

export class CreateUpdateFuelTank implements CreateUpdateFuelTankUseCaseI {
  constructor(private readonly fuelRepository: FuelRepository) {}

  async execute(
    createUpdateTankDto: CreateUpdateFuelTankDto
  ): Promise<FuelTank> {
    return await this.fuelRepository.createOrUpdateFuelTankLevel(
      createUpdateTankDto
    );
  }
}
