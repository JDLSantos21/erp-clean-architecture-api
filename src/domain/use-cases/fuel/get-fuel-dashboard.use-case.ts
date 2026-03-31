import { FuelDashboardQueryDto } from "../../dtos";
import { FuelDashboard } from "../../entities";
import { FuelAnalyticsRepository } from "../../repositories";

interface GetFuelDashboardUseCase {
  execute(params: FuelDashboardQueryDto): Promise<FuelDashboard>;
}

export class GetFuelDashboard implements GetFuelDashboardUseCase {
  constructor(
    private readonly fuelAnalyticsRepository: FuelAnalyticsRepository,
  ) {}

  async execute(params: FuelDashboardQueryDto): Promise<FuelDashboard> {
    return await this.fuelAnalyticsRepository.getDashboardData(params);
  }
}
