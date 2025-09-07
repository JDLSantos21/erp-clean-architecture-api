import { Request, Response } from "express";
import {
  CreateEmployee,
  CreateEmployeeDto,
  CustomError,
  EmployeeQueryDto,
  EmployeeRepository,
  UpdateEmployeeDto,
  UpdateEmployeeUseCase,
} from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { Validators } from "../../config/validators";

export class EmployeeController {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

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

  createEmployee = async (req: Request, res: Response) => {
    const [error, dto] = CreateEmployeeDto.create(req.body);

    if (error) {
      res.json(ResponseBuilder.error(400, error, req));
      return;
    }

    new CreateEmployee(this.employeeRepository)
      .execute(dto!)
      .then((employee) =>
        res.status(201).json(ResponseBuilder.success(employee, req))
      )
      .catch((error) => this.handleError(error, res, req));
  };

  findAll = async (req: Request, res: Response) => {
    const [error, dto] = EmployeeQueryDto.create(req.query);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { page, limit, ...filters } = dto!;
    const skip = (page - 1) * limit;

    const { employees, total } = await this.employeeRepository.findAll({
      skip,
      limit,
      filters,
    });

    res
      .status(200)
      .json(
        ResponseBuilder.successWithPagination(
          employees,
          { limit, page, total },
          req
        )
      );
  };

  findById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || !Validators.uuid.test(id)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "Código de empleado no válido", req));
      return;
    }

    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      res
        .status(404)
        .json(ResponseBuilder.error(404, "Empleado no encontrado", req));
      return;
    }

    res.status(200).json(ResponseBuilder.success(employee, req));
  };

  deleteEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || !Validators.uuid.test(id)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "Código de empleado no válido", req));
    }

    try {
      await this.employeeRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || !Validators.uuid.test(id)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "Código de empleado no válido", req));
      return;
    }

    const [error, dto] = UpdateEmployeeDto.create(req.body);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      new UpdateEmployeeUseCase(this.employeeRepository)
        .execute(id, dto!)
        .then((employee) =>
          res.status(200).json(ResponseBuilder.success(employee, req))
        )
        .catch((error) => this.handleError(error, res, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
