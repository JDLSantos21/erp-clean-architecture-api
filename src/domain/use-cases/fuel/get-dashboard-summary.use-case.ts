import { DashboardSummary } from "../../entities/FuelAnalytics";
import { FuelAnalyticsRepository } from "../../repositories/fuel-analytics.repository";

interface GetDashboardSummaryUseCase {
  execute(): Promise<DashboardSummary>;
}

export class GetDashboardSummary implements GetDashboardSummaryUseCase {
  constructor(
    private readonly fuelAnalyticsRepository: FuelAnalyticsRepository
  ) {}

  async execute(): Promise<DashboardSummary> {
    return await this.fuelAnalyticsRepository.getDashboardSummary();
  }
}
