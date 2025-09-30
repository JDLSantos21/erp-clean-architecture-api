import {
  FuelMetricsDto,
  VehicleMetricsDto,
  FuelMetrics,
  DashboardSummary,
  VehicleMetrics,
  FuelAnalyticsRepository,
} from "../../domain";

import { FuelAnalyticsDatasourceImpl } from "../datasources/fuel-analytics.datasource.impl";

export class FuelAnalyticsRepositoryImpl implements FuelAnalyticsRepository {
  constructor(
    private readonly fuelAnalyticsDatasource: FuelAnalyticsDatasourceImpl
  ) {}

  // Dashboard Summary
  getDashboardSummary(): Promise<DashboardSummary> {
    return this.fuelAnalyticsDatasource.getDashboardSummary();
  }

  // Dashboard Metrics
  getDashboardMetrics(params: FuelMetricsDto): Promise<FuelMetrics> {
    return this.fuelAnalyticsDatasource.getDashboardMetrics(params);
  }

  // Vehicle Metrics
  getVehicleMetrics(params: VehicleMetricsDto): Promise<VehicleMetrics> {
    return this.fuelAnalyticsDatasource.getVehicleMetrics(params);
  }
}
