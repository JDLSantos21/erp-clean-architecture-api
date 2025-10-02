import { FuelMetricsDto } from "../../dtos";
import { FuelMetrics } from "../../entities";
import { FuelAnalyticsRepository } from "../../repositories";

interface GetDashboardMetricsUseCase {
  execute(params: FuelMetricsDto): Promise<FuelMetrics>;
}

export class GetDashboardMetrics implements GetDashboardMetricsUseCase {
  constructor(
    private readonly fuelAnalyticsRepository: FuelAnalyticsRepository
  ) {}

  async execute(params: FuelMetricsDto): Promise<FuelMetrics> {
    return await this.fuelAnalyticsRepository.getDashboardMetrics(params);
  }
}
