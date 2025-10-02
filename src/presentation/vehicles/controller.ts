import {
  CreateVehicle,
  CustomError,
  RegisterVehicleDto,
  UpdateVehicle,
  VehicleRepository,
  VehicleQueryDto,
} from "../../domain";
import { Request, Response } from "express";
import { BaseController } from "../shared/base.controller";

export class VehicleController extends BaseController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicle,
    private readonly updateVehicleUseCase: UpdateVehicle,
    private readonly vehicleRepository: VehicleRepository
  ) {
    super();
  }

  createVehicle = async (req: Request, res: Response) => {
    try {
      const [error, registerVehicleDto] = RegisterVehicleDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const vehicle = await this.createVehicleUseCase.execute(
        registerVehicleDto!
      );
      this.handleCreated(res, vehicle, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getVehicles = async (req: Request, res: Response) => {
    try {
      const [error, vehicleQueryDto] = VehicleQueryDto.create(req.query);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { page, limit, ...filters } = vehicleQueryDto!;
      const skip = (page - 1) * limit;

      const { vehicles, total } = await this.vehicleRepository.getVehicles({
        skip,
        limit,
        filters,
      });

      this.handleSuccessWithPagination(
        res,
        vehicles,
        { page, limit, total },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getVehicleById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const vehicle = await this.vehicleRepository.getVehicleById(id);
      this.handleSuccess(res, vehicle, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateVehicle = async (req: Request, res: Response) => {
    try {
      const [error, registerVehicleDto] = RegisterVehicleDto.create(req.body);
      const id = req.params.id;

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const vehicle = await this.updateVehicleUseCase.execute(
        id,
        registerVehicleDto!
      );
      this.handleSuccess(res, vehicle, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteVehicle = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      await this.vehicleRepository.deleteVehicle(id);
      this.handleSuccess(res, { message: "Vehicle deleted successfully" }, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
