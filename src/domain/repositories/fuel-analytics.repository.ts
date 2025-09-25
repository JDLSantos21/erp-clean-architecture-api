import { FuelMetricsDto, VehicleMetricsDto } from "../dtos";
import { FuelMetrics, DashboardSummary } from "../entities";
import { VehicleMetrics } from "../entities/vehicle/VehicleAnalytics";

export abstract class FuelAnalyticsRepository {
  // Dashboard Summary
  abstract getDashboardSummary(): Promise<DashboardSummary>;

  // Dashboard Metrics
  abstract getDashboardMetrics(params: FuelMetricsDto): Promise<FuelMetrics>;

  // Vehicle Metrics
  abstract getVehicleMetrics(
    params: VehicleMetricsDto
  ): Promise<VehicleMetrics>;
}
