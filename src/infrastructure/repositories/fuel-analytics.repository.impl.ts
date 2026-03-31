import {
  FuelMetricsDto,
  VehicleMetricsDto,
  FuelDashboardQueryDto,
  FuelMetrics,
  DashboardSummary,
  VehicleMetrics,
  FuelDashboard,
  FuelAnalyticsRepository,
} from "../../domain";

import { FuelAnalyticsDatasourceImpl } from "../datasources/fuel-analytics.datasource.impl";
import { FuelDashboardDatasourceImpl } from "../datasources/fuel-dashboard.datasource.impl";

export class FuelAnalyticsRepositoryImpl implements FuelAnalyticsRepository {
  constructor(
    private readonly fuelAnalyticsDatasource: FuelAnalyticsDatasourceImpl,
    private readonly fuelDashboardDatasource: FuelDashboardDatasourceImpl,
  ) {}

  getDashboardSummary(): Promise<DashboardSummary> {
    return this.fuelAnalyticsDatasource.getDashboardSummary();
  }

  // Dashboard Metrics (legacy)
  getDashboardMetrics(params: FuelMetricsDto): Promise<FuelMetrics> {
    return this.fuelAnalyticsDatasource.getDashboardMetrics(params);
  }

  getVehicleMetrics(params: VehicleMetricsDto): Promise<VehicleMetrics> {
    return this.fuelAnalyticsDatasource.getVehicleMetrics(params);
  }

  // Dashboard Data (nuevo endpoint unificado para /fuel/metrics del frontend)
  getDashboardData(params: FuelDashboardQueryDto): Promise<FuelDashboard> {
    return this.fuelDashboardDatasource.getDashboardData(params);
  }
}
