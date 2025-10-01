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

export class InventoryController extends BaseController {
  constructor(private readonly inventoryRepository: InventoryRepository) {
    super();
  }

  createMovement = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const [error, dto] = CreateStockMoveDto.create(req.body, userId);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const movement = await new CreateStockMove(
        this.inventoryRepository
      ).execute(dto!);

      this.handleCreated(res, movement, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
  createMaterial = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CreateMaterialDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const material = await new CreateMaterial(
        this.inventoryRepository
      ).execute(dto!);

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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const material = await new UpdateMaterial(
        this.inventoryRepository
      ).execute(id, dto!);

      this.handleSuccess(res, material, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteMaterial = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        return this.handleError(
          CustomError.badRequest("El ID del material no es válido"),
          res,
          req
        );
      }

      await new DeleteMaterial(this.inventoryRepository).execute(id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createMaterialCategory = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        return this.handleError(
          CustomError.badRequest("El nombre es requerido"),
          res,
          req
        );
      }

      const category = await this.inventoryRepository.getMaterialCategoryByName(
        name
      );

      if (category) {
        return this.handleError(
          CustomError.badRequest("La categoría ya existe"),
          res,
          req
        );
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
        return this.handleError(CustomError.badRequest(error), res, req);
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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const { materials, total } = await this.inventoryRepository.getMaterials(
        filters,
        limit,
        skip
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

      if (isNaN(id) || id <= 0) {
        return this.handleError(
          CustomError.badRequest("El ID del material no es válido"),
          res,
          req
        );
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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const { stockMoves, total } =
        await this.inventoryRepository.getStockMoves(filters, limit, skip);

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
        return this.handleError(
          CustomError.badRequest(
            "El ID del movimiento de inventario no es válido"
          ),
          res,
          req
        );
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
        return this.handleError(
          CustomError.badRequest("El ID de la unidad no es válido"),
          res,
          req
        );
      }

      await new DeleteUnit(this.inventoryRepository).execute(id);
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
        return this.handleError(
          CustomError.badRequest("El ID de la categoría no es válido"),
          res,
          req
        );
      }

      await new DeleteCategory(this.inventoryRepository).execute(id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
