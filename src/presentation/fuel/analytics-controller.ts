import { Request, Response } from "express";
import {
  FuelAnalyticsRepository,
  GetDashboardSummary,
  GetDashboardMetrics,
  GetVehicleMetrics,
  FuelMetricsDto,
  VehicleMetricsDto,
  CustomError,
} from "../../domain";

import { BaseController } from "../shared/base.controller";

export class FuelAnalyticsController extends BaseController {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummary,
    private readonly getDashboardMetricsUseCase: GetDashboardMetrics,
    private readonly getVehicleMetricsUseCase: GetVehicleMetrics,
    private readonly fuelAnalyticsRepository: FuelAnalyticsRepository
  ) {
    super();
  }

  getDashboardSummary = async (req: Request, res: Response) => {
    try {
      const summary = await this.getDashboardSummaryUseCase.execute();
      this.handleSuccess(res, summary, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getDashboardMetrics = async (req: Request, res: Response) => {
    const [error, dto] = FuelMetricsDto.create(req.query);

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
    }

    try {
      const metrics = await this.getDashboardMetricsUseCase.execute(dto!);
      this.handleSuccess(res, metrics, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getVehicleMetrics = async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const [error, dto] = VehicleMetricsDto.create({ ...req.query, vehicleId });

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
    }

    try {
      const metrics = await this.getVehicleMetricsUseCase.execute(dto!);
      this.handleSuccess(res, metrics, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
