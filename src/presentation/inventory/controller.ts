import {
  CreateMaterial,
  CreateMaterialDto,
  CreateStockMove,
  CreateStockMoveDto,
  CreateUnitDto,
  CustomError,
  DeleteMaterial,
  InventoryRepository,
  StockMoveQueryDto,
  UpdateMaterial,
  DeleteUnit,
  DeleteCategory,
  MaterialQueryDto,
  UpdateMaterialDto,
} from "../../domain";
import { Request, Response } from "express";
import { Validators } from "../../config";
import { BaseController } from "../shared/base.controller";
import { error } from "console";

export class InventoryController extends BaseController {
  constructor(
    private readonly createMaterialUseCase: CreateMaterial,
    private readonly updateMaterialUseCase: UpdateMaterial,
    private readonly deleteMaterialUseCase: DeleteMaterial,
    private readonly createStockMoveUseCase: CreateStockMove,
    private readonly deleteUnitUseCase: DeleteUnit,
    private readonly deleteCategoryUseCase: DeleteCategory,
    private readonly inventoryRepository: InventoryRepository
  ) {
    super();
  }

  createMovement = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const [error, dto] = CreateStockMoveDto.create(req.body, userId);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const movement = await this.createStockMoveUseCase.execute(dto!);

      this.handleCreated(res, movement, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
  createMaterial = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateMaterialDto.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const material = await this.createMaterialUseCase.execute(dto!);

      this.handleCreated(res, material, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateMaterial = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const [error, dto] = UpdateMaterialDto.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const material = await this.updateMaterialUseCase.execute(id, dto!);

      this.handleSuccess(res, material, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteMaterial = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!Validators.isPositiveInteger(id)) {
        const customError = CustomError.badRequest(
          "El ID del material no es válido"
        );
        return this.handleError(customError, res, req);
      }

      await this.deleteMaterialUseCase.execute(id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createMaterialCategory = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        const customError = CustomError.badRequest("El nombre es requerido");
        return this.handleError(customError, res, req);
      }

      const category = await this.inventoryRepository.getMaterialCategoryByName(
        name
      );

      if (category) {
        const customError = CustomError.badRequest("La categoría ya existe");
        return this.handleError(customError, res, req);
      }

      const newCategory = await this.inventoryRepository.createMaterialCategory(
        name
      );
      this.handleCreated(res, newCategory, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createMaterialUnit = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateUnitDto.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const unit = await this.inventoryRepository.createUnit(dto!);
      this.handleCreated(res, unit, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaterials = async (req: Request, res: Response) => {
    try {
      const [error, dto] = MaterialQueryDto.create(req.query);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const filterParams = { filters, limit, skip };

      const { materials, total } = await this.inventoryRepository.getMaterials(
        filterParams
      );

      const pagination = { limit, page, total };
      this.handleSuccessWithPagination(res, materials, pagination, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaterialById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!Validators.isPositiveInteger(id)) {
        const customError = CustomError.badRequest(
          "El ID del material no es válido"
        );
        return this.handleError(customError, res, req);
      }

      const { moves } = req.query;
      const includeMoves = moves === "true";

      const material = await this.inventoryRepository.getMaterialById(
        id,
        includeMoves
      );
      this.handleSuccess(res, material, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getStockMoves = async (req: Request, res: Response) => {
    try {
      const [error, dto] = StockMoveQueryDto.create(req.query);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const filterParams = { filters, limit, skip };
      const { stockMoves, total } =
        await this.inventoryRepository.getStockMoves(filterParams);

      const pagination = { limit, page, total };
      this.handleSuccessWithPagination(res, stockMoves, pagination, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getStockMoveById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!Validators.isPositiveInteger(id)) {
        const customError = CustomError.badRequest(
          "El ID del movimiento de inventario no es válido"
        );
        return this.handleError(customError, res, req);
      }

      const stockMove = await this.inventoryRepository.getStockMoveById(id);
      this.handleSuccess(res, stockMove, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getUnits = async (req: Request, res: Response) => {
    try {
      const units = await this.inventoryRepository.getUnits();
      this.handleSuccess(res, units, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteUnit = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!Validators.isPositiveInteger(id)) {
        const customError = CustomError.badRequest(
          "El ID de la unidad no es válido"
        );
        return this.handleError(customError, res, req);
      }
      await this.deleteUnitUseCase.execute(id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.inventoryRepository.getMaterialCategories();
      this.handleSuccess(res, categories, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteCategory = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!Validators.isPositiveInteger(id)) {
        const customError = CustomError.badRequest(
          "El ID de la categoría no es válido"
        );
        return this.handleError(customError, res, req);
      }

      await this.deleteCategoryUseCase.execute(id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
