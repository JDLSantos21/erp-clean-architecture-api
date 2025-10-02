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
import { Validators } from "../../config/validators";
import { BaseController } from "../shared/base.controller";

export class EmployeeController extends BaseController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployee,
    private readonly updateEmployeeUseCase: UpdateEmployeeUseCase,
    private readonly employeeRepository: EmployeeRepository
  ) {
    super();
  }

  createEmployee = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateEmployeeDto.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const employee = await this.createEmployeeUseCase.execute(dto!);
      this.handleCreated(res, employee, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const [error, dto] = EmployeeQueryDto.create(req.query);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const filterParams = { filters, limit, skip };

      const { employees, total } = await this.employeeRepository.findAll(
        filterParams
      );

      const pagination = { page, limit, total };
      this.handleSuccessWithPagination(res, employees, pagination, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || !Validators.uuid.test(id)) {
        const customError = CustomError.badRequest(
          "Código de empleado no válido"
        );
        return this.handleError(customError, res, req);
      }

      const employee = await this.employeeRepository.findById(id);

      if (!employee) {
        const customError = CustomError.notFound("Empleado no encontrado");
        return this.handleError(customError, res, req);
      }

      this.handleSuccess(res, employee, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteEmployee = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || !Validators.uuid.test(id)) {
        const customError = CustomError.badRequest(
          "Código de empleado no válido"
        );
        return this.handleError(customError, res, req);
      }

      await this.employeeRepository.delete(id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateEmployee = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || !Validators.uuid.test(id)) {
        const customError = CustomError.badRequest(
          "Código de empleado no válido"
        );
        return this.handleError(customError, res, req);
      }

      const [error, dto] = UpdateEmployeeDto.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const employee = await this.updateEmployeeUseCase.execute(id, dto!);
      this.handleSuccess(res, employee, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
