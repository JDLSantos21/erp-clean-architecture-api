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
import { Request, Response } from "express";
import { BaseController } from "../shared/base.controller";

export class FuelController extends BaseController {
  constructor(
    private readonly fuelRepository: FuelRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly employeeRepository: EmployeeRepository
  ) {
    super();
  }

  createFuelTank = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateFuelTankDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const currentTank = await this.fuelRepository.getTankCurrentStatus();

      if (currentTank) {
        throw CustomError.badRequest("Ya existe un tanque de combustible");
      }

      const fuelTank = await this.fuelRepository.createFuelTank(dto!);
      this.handleCreated(res, fuelTank, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createFuelConsumption = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      const [error, dto] = CreateFuelConsumptionDto.create(req.body, user!.id);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const consumption = await new CreateFuelConsumption(
        this.fuelRepository,
        this.vehicleRepository,
        this.employeeRepository
      ).execute(dto!);

      this.handleCreated(res, consumption, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateFuelConsumption = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const idNum = Number(id);

      if (!id || isNaN(idNum) || idNum <= 0) {
        return this.handleError(
          CustomError.badRequest("El ID de consumo no es válido"),
          res,
          req
        );
      }

      const [error, dto] = UpdateFuelConsumptionDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const consumption = await new UpdateFuelConsumption(
        this.fuelRepository
      ).execute(idNum, dto!);

      this.handleSuccess(res, consumption, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createFuelTankRefill = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const [error, dto] = CreateFuelTankRefillDto.create(req.body, user!.id);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const refill = await new CreateFuelTankRefill(
        this.fuelRepository
      ).execute(dto!);

      this.handleCreated(res, refill, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getTankCurrentStatus = async (req: Request, res: Response) => {
    try {
      const status = await this.fuelRepository.getTankCurrentStatus();
      this.handleSuccess(res, status, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  resetFuelTankLevel = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      const [error, dto] = ResetFuelTankDto.create(req.body, user!.id);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { password, userId } = dto!;

      const isValid = BcryptAdapter.compare(password, user!.password);

      if (!isValid) throw new CustomError(401, "La contraseña es incorrecta");

      const reset = await this.fuelRepository.resetFuelTankLevel(userId);
      this.handleSuccess(res, reset, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findAllTankRefills = async (req: Request, res: Response) => {
    try {
      const [error, dto] = FuelTankRefillQueryDto.create(req.query);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const { refills, totalPages } =
        await this.fuelRepository.findAllTankRefills({
          skip,
          limit,
          filters,
        });

      this.handleSuccessWithPagination(
        res,
        refills,
        { page, limit, total: totalPages },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findTankRefillById = async (req: Request, res: Response) => {
    try {
      const { consumptions } = req.query;
      const [error, dto] = FuelTankRefillByIdDto.create(
        req.params,
        consumptions
      );

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const refill = await this.fuelRepository.getFuelTankRefillById(
        dto!.id,
        dto!.consumptions
      );

      if (!refill) {
        return this.handleError(
          CustomError.notFound("Reabastecimiento no encontrado"),
          res,
          req
        );
      }

      this.handleSuccess(res, refill, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findAllFuelConsumptions = async (req: Request, res: Response) => {
    try {
      const [error, dto] = FuelConsumptionQueryDto.create(req.query);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const { consumptions, totalPages } =
        await this.fuelRepository.findAllFuelConsumptions({
          skip,
          limit,
          filters,
        });

      this.handleSuccessWithPagination(
        res,
        consumptions,
        { page, limit, total: totalPages },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteFuelConsumption = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await new DeleteFuelConsumption(this.fuelRepository).execute(Number(id));

      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
