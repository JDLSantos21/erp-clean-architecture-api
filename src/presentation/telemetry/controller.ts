import { Request, Response } from "express";
import { DIContainer } from "../../infrastructure/di/container";
import {
  SyncFleetUseCase,
  GetNearbyVehiclesUseCase,
} from "../../domain/use-cases/telemetry";
import { GetNearbyVehiclesDto } from "../../domain/dtos/telemetry/get-nearby-vehicles.dto";
import { BaseController } from "../shared/base.controller";
import { CustomError } from "../../domain";

export class TelemetryController extends BaseController {
  constructor() {
    super();
  }

  public syncFleet = async (req: Request, res: Response) => {
    try {
      const container = DIContainer.getInstance();
      const syncFleetUseCase =
        container.resolve<SyncFleetUseCase>("SyncFleetUseCase");

      await syncFleetUseCase.execute();

      this.handleSuccess(
        res,
        {
          message: "Fleet synchronization started/completed successfully",
        },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  public getNearbyVehicles = async (req: Request, res: Response) => {
    try {
      const { lat, lng, radiusKm } = req.query;

      if (!lat || !lng || !radiusKm) {
        const customError = CustomError.badRequest(
          "Missing query parameters: lat, lng, radiusKm"
        );
        this.handleError(customError, res, req);
        return;
      }

      const dto: GetNearbyVehiclesDto = {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        radiusKm: parseFloat(radiusKm as string),
      };

      const container = DIContainer.getInstance();
      const getNearbyVehiclesUseCase =
        container.resolve<GetNearbyVehiclesUseCase>("GetNearbyVehiclesUseCase");

      const vehicles = await getNearbyVehiclesUseCase.execute(dto);

      this.handleSuccess(res, vehicles, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
