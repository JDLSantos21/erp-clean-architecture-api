import { FuelMetricsDto, VehicleMetricsDto } from "../dtos";
import { FuelMetrics, DashboardSummary } from "../entities";
import { VehicleMetrics } from "../entities/vehicle/VehicleAnalytics";

export abstract class FuelAnalyticsRepository {
  abstract getDashboardSummary(): Promise<DashboardSummary>;
  abstract getDashboardMetrics(params: FuelMetricsDto): Promise<FuelMetrics>;
  abstract getVehicleMetrics(
    params: VehicleMetricsDto
  ): Promise<VehicleMetrics>;
}
