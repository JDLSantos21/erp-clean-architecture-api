import { BcryptAdapter } from "../../config";
import {
  CreateFuelConsumption,
  CreateFuelConsumptionDto,
  CreateFuelTankRefill,
  CreateFuelTankDto,
  CustomError,
  FuelRepository,
  VehicleRepository,
  EmployeeRepository,
  CreateFuelTankRefillDto,
  ResetFuelTankDto,
  FuelConsumptionQueryDto,
  FuelTankRefillQueryDto,
  FuelTankRefillByIdDto,
  UpdateFuelConsumption,
  UpdateFuelConsumptionDto,
  DeleteFuelConsumption,
} from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { Request, Response } from "express";

export class FuelController {
  constructor(
    private readonly fuelRepository: FuelRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly employeeRepository: EmployeeRepository
  ) {}
  private handleError = (error: unknown, res: Response, req: Request) => {
    console.log("Fuel Controller Error: ", error);
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Internal server error", req));
  };

  createFuelTank = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateFuelTankDto.create(req.body);

      if (error) {
        res.status(400).json(ResponseBuilder.error(400, error, req));
        return;
      }

      const currentTank = await this.fuelRepository.getTankCurrentStatus();

      if (currentTank) {
        throw CustomError.badRequest("Ya existe un tanque de combustible");
      }

      const fuelTank = await this.fuelRepository.createFuelTank(dto!);
      const response = ResponseBuilder.success(fuelTank, req);
      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createFuelConsumption = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      const [error, dto] = CreateFuelConsumptionDto.create(req.body, user!.id);

      if (error) {
        res.status(400).json(ResponseBuilder.error(400, error, req));
        return;
      }

      const consumption = await new CreateFuelConsumption(
        this.fuelRepository,
        this.vehicleRepository,
        this.employeeRepository
      ).execute(dto!);

      const response = ResponseBuilder.success(consumption, req);
      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateFuelConsumption = async (req: Request, res: Response) => {
    const { id } = req.params;

    const idNum = Number(id);

    if (!id || isNaN(idNum) || idNum <= 0) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "El ID de consumo no es válido", req));
      return;
    }

    const [error, dto] = UpdateFuelConsumptionDto.create(req.body);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const consumption = await new UpdateFuelConsumption(
        this.fuelRepository
      ).execute(idNum, dto!);

      const response = ResponseBuilder.success(consumption, req);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createFuelTankRefill = async (req: Request, res: Response) => {
    const user = req.user;
    const [error, dto] = CreateFuelTankRefillDto.create(req.body, user!.id);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const refill = await new CreateFuelTankRefill(
        this.fuelRepository
      ).execute(dto!);

      const response = ResponseBuilder.success(refill, req);
      res.status(201).json(response);
      console.log(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getTankCurrentStatus = async (req: Request, res: Response) => {
    try {
      const status = await this.fuelRepository.getTankCurrentStatus();
      const response = ResponseBuilder.success(status, req);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  resetFuelTankLevel = async (req: Request, res: Response) => {
    const user = req.user;

    const [error, dto] = ResetFuelTankDto.create(req.body, user!.id);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { password, userId } = dto!;

    const isValid = BcryptAdapter.compare(password, user!.password);

    try {
      if (!isValid) throw new CustomError(401, "La contraseña es incorrecta");
      const reset = await this.fuelRepository.resetFuelTankLevel(userId);
      const response = ResponseBuilder.success(reset, req);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findAllTankRefills = async (req: Request, res: Response) => {
    const [error, dto] = FuelTankRefillQueryDto.create(req.query);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { page, limit, ...filters } = dto!;
    const skip = (page - 1) * limit;

    try {
      const { refills, totalPages } =
        await this.fuelRepository.findAllTankRefills({
          skip,
          limit,
          filters,
        });
      const response = ResponseBuilder.successWithPagination(
        refills,
        { page, limit, total: totalPages },
        req
      );
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findTankRefillById = async (req: Request, res: Response) => {
    const { consumptions } = req.query;
    const [error, dto] = FuelTankRefillByIdDto.create(req.params, consumptions);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const refill = await this.fuelRepository.getFuelTankRefillById(
        dto!.id,
        dto!.consumptions
      );

      if (!refill) {
        res
          .status(404)
          .json(
            ResponseBuilder.error(404, "Reabastecimiento no encontrado", req)
          );
        return;
      }

      const response = ResponseBuilder.success(refill, req);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findAllFuelConsumptions = async (req: Request, res: Response) => {
    const [error, dto] = FuelConsumptionQueryDto.create(req.query);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { page, limit, ...filters } = dto!;
    const skip = (page - 1) * limit;

    try {
      const { consumptions, totalPages } =
        await this.fuelRepository.findAllFuelConsumptions({
          skip,
          limit,
          filters,
        });
      const response = ResponseBuilder.successWithPagination(
        consumptions,
        { page, limit, total: totalPages },
        req
      );
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteFuelConsumption = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await new DeleteFuelConsumption(this.fuelRepository).execute(Number(id));

      const response = ResponseBuilder.success({}, req);
      res.status(204).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
