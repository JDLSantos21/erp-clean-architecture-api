import { Request, Response } from "express";
import {
  AssignEquipment,
  CreateEquipment,
  CreateEquipmentAssignmentDto,
  CreateEquipmentDto,
  CreateEquipmentModelDto,
  CustomError,
  EquipmentQueryDto,
  EquipmentRepository,
  FilterParams,
  IntegerId,
  UnassignEquipment,
  UnassignEquipmentDto,
  UpdateEquipmentModelDto,
  UUID,
} from "../../domain";
import { BaseController } from "../shared/base.controller";
import { EquipmentResponseDto, modelResponseDto } from "../dtos";

export class EquipmentController extends BaseController {
  constructor(
    private readonly createEquipmentUseCase: CreateEquipment,
    private readonly assignEquipmentUseCase: AssignEquipment,
    private readonly unassignEquipmentUseCase: UnassignEquipment,
    private readonly equipmentRepository: EquipmentRepository
  ) {
    super();
  }

  create = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateEquipmentDto.create(req.body);
      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const equipment = await this.createEquipmentUseCase.execute(dto!);
      const equipmentRes = EquipmentResponseDto.fromEntity(equipment, {
        includeModel: true,
      });
      this.handleCreated(res, equipmentRes, req);
    } catch (error) {
      this.handleError(error, res, req);
      return;
    }
  };

  getEquipmentById = async (req: Request, res: Response) => {
    const equipmentId = req.params.id;
    try {
      const equipment = await this.equipmentRepository.findOne(
        UUID.create(equipmentId)
      );

      const equipmentDto = EquipmentResponseDto.fromEntity(equipment, {
        includeModel: true,
        includeLocation: true,
        includeAssignments: true,
      });

      this.handleSuccess(res, equipmentDto, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const [error, dto] = EquipmentQueryDto.create(req.query);
      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { limit, page, ...filters } = dto!;

      const filterParams: FilterParams<EquipmentQueryDto> = {
        filters,
        limit,
        skip: (page - 1) * limit,
      };

      const { equipments, total } = await this.equipmentRepository.findAll(
        filterParams
      );
      const equipmentDtos = EquipmentResponseDto.fromEntities(equipments);
      const pagination = { total, page, limit };
      this.handleSuccessWithPagination(res, equipmentDtos, pagination, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAllByCustomerId = async (req: Request, res: Response) => {
    const customerId = req.params.customerId;

    try {
      const equipments = await this.equipmentRepository.findAllByCustomerId(
        UUID.create(customerId)
      );
      const equipmentDtos = EquipmentResponseDto.fromEntities(equipments, {
        includeAssignments: true,
        includeLocation: true,
        includeModel: true,
      });
      this.handleSuccess(res, equipmentDtos, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // assignments

  assignEquipment = async (req: Request, res: Response) => {
    const userId = req.user.id;
    try {
      const [error, dto] = CreateEquipmentAssignmentDto.create({
        ...req.body,
        assigned_by: userId,
      });

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      await this.assignEquipmentUseCase.execute(dto!);
      this.handleCreated(res, { message: "Asignación creada" }, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  unassignEquipment = async (req: Request, res: Response) => {
    const userId = req.user.id;
    try {
      const [error, dto] = UnassignEquipmentDto.create({
        ...req.body,
        unassigned_by: userId,
      });
      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }
      await this.unassignEquipmentUseCase.execute(dto!);
      this.handleSuccess(res, { message: "Asignación eliminada" }, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Models

  createModel = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateEquipmentModelDto.create(req.body);
      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }
      const model = await this.equipmentRepository.createEquipmentModel(dto!);
      this.handleCreated(res, modelResponseDto.fromEntity(model), req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateModel = async (req: Request, res: Response) => {
    const modelId = req.params.id;
    try {
      const [error, dto] = UpdateEquipmentModelDto.create(req.body);
      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }
      const model = await this.equipmentRepository.updateModel(
        IntegerId.create(Number(modelId)),
        dto!
      );
      this.handleSuccess(res, modelResponseDto.fromEntity(model), req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAllModels = async (req: Request, res: Response) => {
    try {
      const models = await this.equipmentRepository.findAllModels();
      this.handleSuccess(res, modelResponseDto.fromEntities(models), req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getModelById = async (req: Request, res: Response) => {
    try {
      const modelId = req.params.id;
      const model = await this.equipmentRepository.findOneModel(
        IntegerId.create(Number(modelId))
      );
      this.handleSuccess(res, modelResponseDto.fromEntity(model), req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
