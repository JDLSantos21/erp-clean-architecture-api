import { FuelMetricsDto, VehicleMetricsDto } from "../dtos";
import { FuelMetrics, DashboardSummary, VehicleMetrics } from "../entities";

export abstract class FuelAnalyticsRepository {
  abstract getDashboardSummary(): Promise<DashboardSummary>;
  abstract getDashboardMetrics(params: FuelMetricsDto): Promise<FuelMetrics>;
  abstract getVehicleMetrics(
    params: VehicleMetricsDto
  ): Promise<VehicleMetrics>;
}
