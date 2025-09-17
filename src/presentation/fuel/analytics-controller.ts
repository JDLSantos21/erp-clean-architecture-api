import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { FuelAnalyticsRepository } from "../../domain/repositories/fuel-analytics.repository";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { GetDashboardSummary } from "../../domain/use-cases/fuel/get-dashboard-summary.use-case";
import { GetDashboardMetrics } from "../../domain/use-cases/fuel/get-dashboard-metrics.use-case";
import { GetVehicleMetrics } from "../../domain/use-cases/fuel/get-vehicle-metrics.use-case";
import { FuelMetricsDto, VehicleMetricsDto } from "../../domain/dtos";

export class FuelAnalyticsController {
  constructor(
    private readonly fuelAnalyticsRepository: FuelAnalyticsRepository
  ) {}

  private handleError = (error: unknown, res: Response, req: Request) => {
    console.log("Error:", error);
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Internal server error", req));
  };

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
