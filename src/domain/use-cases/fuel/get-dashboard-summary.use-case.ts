import { DashboardSummary } from "../../entities";
import { FuelAnalyticsRepository } from "../../repositories";

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
