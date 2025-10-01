import { Request, Response } from "express";
import {
  FuelAnalyticsRepository,
  GetDashboardSummary,
  GetDashboardMetrics,
  GetVehicleMetrics,
  FuelMetricsDto,
  VehicleMetricsDto,
} from "../../domain";

import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { BaseController } from "../shared/base.controller";

export class FuelAnalyticsController extends BaseController {
  constructor(
    private readonly fuelAnalyticsRepository: FuelAnalyticsRepository
  ) {
    super();
  }

  // GET /api/fuel/dashboard/summary
  getDashboardSummary = async (req: Request, res: Response) => {
    try {
      const getDashboardSummary = new GetDashboardSummary(
        this.fuelAnalyticsRepository
      );
      const summary = await getDashboardSummary.execute();

      const response = ResponseBuilder.success(summary, req);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // GET /api/fuel/dashboard/metrics
  getDashboardMetrics = async (req: Request, res: Response) => {
    const [error, dto] = FuelMetricsDto.create(req.query);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const getDashboardMetrics = new GetDashboardMetrics(
        this.fuelAnalyticsRepository
      );
      const metrics = await getDashboardMetrics.execute(dto!);

      const response = ResponseBuilder.success(metrics, req);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // GET /api/fuel/dashboard/vehicle/:vehicleId/metrics
  getVehicleMetrics = async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const [error, dto] = VehicleMetricsDto.create({ ...req.query, vehicleId });

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const getVehicleMetrics = new GetVehicleMetrics(
        this.fuelAnalyticsRepository
      );
      const metrics = await getVehicleMetrics.execute(dto!);

      const response = ResponseBuilder.success(metrics, req);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
