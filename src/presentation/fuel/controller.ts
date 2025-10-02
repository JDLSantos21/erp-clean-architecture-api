import { BcryptAdapter, Validators } from "../../config";
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
    private readonly createFuelConsumptionUseCase: CreateFuelConsumption,
    private readonly updateFuelConsumptionUseCase: UpdateFuelConsumption,
    private readonly deleteFuelConsumptionUseCase: DeleteFuelConsumption,
    private readonly createFuelTankRefillUseCase: CreateFuelTankRefill,
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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const currentTank = await this.fuelRepository.getTankCurrentStatus();

      if (currentTank) {
        const customError = CustomError.conflict(
          "Ya existe un tanque de combustible"
        );
        this.handleError(customError, res, req);
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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const consumption = await this.createFuelConsumptionUseCase.execute(dto!);

      this.handleCreated(res, consumption, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateFuelConsumption = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const idNum = Number(id);

      if (!Validators.isPositiveInteger(idNum)) {
        const customError = CustomError.badRequest(
          "El ID de consumo no es válido"
        );
        return this.handleError(customError, res, req);
      }

      const [error, dto] = UpdateFuelConsumptionDto.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const consumption = await this.updateFuelConsumptionUseCase.execute(
        idNum,
        dto!
      );

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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const refill = await this.createFuelTankRefillUseCase.execute(dto!);

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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { password, userId } = dto!;

      const isValid = BcryptAdapter.compare(password, user!.password);

      if (!isValid) {
        const customError = CustomError.unauthorized(
          "La contraseña es incorrecta"
        );
        return this.handleError(customError, res, req);
      }

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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const filterParams = { filters, limit, skip };
      const { refills, totalPages } =
        await this.fuelRepository.findAllTankRefills(filterParams);

      const pagination = { page, limit, total: totalPages };
      this.handleSuccessWithPagination(res, refills, pagination, req);
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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const refill = await this.fuelRepository.getFuelTankRefillById(
        dto!.id,
        dto!.consumptions
      );

      if (!refill) {
        const customError = CustomError.notFound(
          "Reabastecimiento no encontrado"
        );
        return this.handleError(customError, res, req);
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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const filterParams = { filters, limit, skip };

      const { consumptions, totalPages } =
        await this.fuelRepository.findAllFuelConsumptions(filterParams);

      const pagination = { page, limit, total: totalPages };
      this.handleSuccessWithPagination(res, consumptions, pagination, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteFuelConsumption = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.deleteFuelConsumptionUseCase.execute(Number(id));

      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
