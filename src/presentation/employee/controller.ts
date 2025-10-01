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
  constructor(private readonly employeeRepository: EmployeeRepository) {
    super();
  }

  createEmployee = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateEmployeeDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const employee = await new CreateEmployee(
        this.employeeRepository
      ).execute(dto!);
      this.handleCreated(res, employee, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const [error, dto] = EmployeeQueryDto.create(req.query);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const { employees, total } = await this.employeeRepository.findAll({
        skip,
        limit,
        filters,
      });

      this.handleSuccessWithPagination(
        res,
        employees,
        { limit, page, total },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || !Validators.uuid.test(id)) {
        return this.handleError(
          CustomError.badRequest("Código de empleado no válido"),
          res,
          req
        );
      }

      const employee = await this.employeeRepository.findById(id);

      if (!employee) {
        return this.handleError(
          CustomError.notFound("Empleado no encontrado"),
          res,
          req
        );
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
        return this.handleError(
          CustomError.badRequest("Código de empleado no válido"),
          res,
          req
        );
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
        return this.handleError(
          CustomError.badRequest("Código de empleado no válido"),
          res,
          req
        );
      }

      const [error, dto] = UpdateEmployeeDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const employee = await new UpdateEmployeeUseCase(
        this.employeeRepository
      ).execute(id, dto!);
      this.handleSuccess(res, employee, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
