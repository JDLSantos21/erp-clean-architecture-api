import {
  CreateVehicle,
  CustomError,
  RegisterVehicleDto,
  UpdateVehicle,
  VehicleRepository,
  VehicleQueryDto,
} from "../../domain";
import { Request, Response } from "express";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";

export class VehicleController {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  private handleError = (error: unknown, res: Response, req: Request) => {
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Internal server error", req));
  };

  createVehicle = async (req: Request, res: Response) => {
    const [error, registerVehicleDto] = RegisterVehicleDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new CreateVehicle(this.vehicleRepository)
      .execute(registerVehicleDto!)
      .then((vehicle) => res.json(vehicle))
      .catch((error) => this.handleError(error, res, req));
    try {
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getVehicles = async (req: Request, res: Response) => {
    const [error, vehicleQueryDto] = VehicleQueryDto.create(req.query);

    console.log("dto:", vehicleQueryDto);

    if (error) {
      console.log("Error creating DTO:", error);
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { page, limit, ...filters } = vehicleQueryDto!;

    const skip = (page - 1) * limit;

    try {
      const { vehicles, total } = await this.vehicleRepository.getVehicles({
        skip,
        limit,
        filters,
      });

      const response = ResponseBuilder.successWithPagination(
        vehicles,
        { page, limit, total },
        req
      );

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getVehicleById = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
      const vehicle = await this.vehicleRepository.getVehicleById(id);
      res.status(200).json(ResponseBuilder.success(vehicle, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateVehicle = async (req: Request, res: Response) => {
    const [error, registerVehicleDto] = RegisterVehicleDto.create(req.body);

    const id = req.params.id;

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new UpdateVehicle(this.vehicleRepository)
      .execute(id, registerVehicleDto!)
      .then((vehicle) =>
        res.status(200).json(ResponseBuilder.success(vehicle, req))
      )
      .catch((error) => this.handleError(error, res, req));
  };

  deleteVehicle = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
      await this.vehicleRepository.deleteVehicle(id);

      res
        .status(200)
        .json(
          ResponseBuilder.success(
            { message: "Vehicle deleted successfully" },
            req
          )
        );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
