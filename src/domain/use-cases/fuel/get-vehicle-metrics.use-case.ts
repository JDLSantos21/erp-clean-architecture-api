import { VehicleMetricsDto } from "../../dtos";
import { VehicleMetrics } from "../../entities/vehicle/VehicleAnalytics";
import { FuelAnalyticsRepository } from "../../repositories/fuel-analytics.repository";

interface GetVehicleMetricsUseCase {
  execute(params: VehicleMetricsDto): Promise<VehicleMetrics>;
}

export class GetVehicleMetrics implements GetVehicleMetricsUseCase {
  constructor(
    private readonly fuelAnalyticsRepository: FuelAnalyticsRepository
  ) {}

  async execute(params: VehicleMetricsDto): Promise<VehicleMetrics> {
    return await this.fuelAnalyticsRepository.getVehicleMetrics(params);
  }
}
