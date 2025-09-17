import { FuelMetricsDto } from "../../dtos";
import { FuelMetrics } from "../../entities/FuelAnalytics";
import { FuelAnalyticsRepository } from "../../repositories/fuel-analytics.repository";

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
