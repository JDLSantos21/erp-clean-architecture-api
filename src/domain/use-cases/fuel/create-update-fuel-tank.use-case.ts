import { CreateUpdateFuelTankDto } from "../../dtos";
import { FuelTank } from "../../entities";
import { FuelRepository } from "../../repositories";

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
