import { FuelMetricsDto, VehicleMetricsDto, FuelDashboardQueryDto } from "../dtos";
import { FuelMetrics, DashboardSummary, VehicleMetrics, FuelDashboard } from "../entities";

export abstract class FuelAnalyticsRepository {
  abstract getDashboardSummary(): Promise<DashboardSummary>;
  abstract getDashboardMetrics(params: FuelMetricsDto): Promise<FuelMetrics>;
  abstract getVehicleMetrics(
    params: VehicleMetricsDto
  ): Promise<VehicleMetrics>;
  abstract getDashboardData(
    params: FuelDashboardQueryDto
  ): Promise<FuelDashboard>;
}
