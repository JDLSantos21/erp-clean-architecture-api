import {
  CreateFuelConsumption,
  CreateFuelConsumptionDto,
  CreateFuelTankDto,
  CustomError,
  FuelRepository,
} from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { Request, Response } from "express";

export class FuelController {
  constructor(private readonly fuelRepository: FuelRepository) {}
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

  createFuelTank = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateFuelTankDto.create(req.body);

      if (error) {
        res.status(400).json(ResponseBuilder.error(400, error, req));
        return;
      }

      const fuelTank = await this.fuelRepository.createFuelTank(dto!);
      const response = ResponseBuilder.success(201, fuelTank, req);
      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createFuelConsumption = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateFuelConsumptionDto.create(req.body);

      if (error) {
        res.status(400).json(ResponseBuilder.error(400, error, req));
        return;
      }

      const consumption = await new CreateFuelConsumption(
        this.fuelRepository
      ).execute(dto!);

      const response = ResponseBuilder.success(consumption, req);
      console.log(response);
      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
