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
} from "../../domain";
import { Request, Response } from "express";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { MaterialQueryDto, UpdateMaterialDto } from "../../domain/dtos";
import { Validators } from "../../config";

export class InventoryController {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  private handleError = (error: unknown, res: Response, req: Request) => {
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Ocurrió un error inesperado", req));
  };

  createMovement = async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const [error, dto] = CreateStockMoveDto.create(req.body, userId);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const movement = await new CreateStockMove(
        this.inventoryRepository
      ).execute(dto!);

      res.json(ResponseBuilder.success(movement, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
  createMaterial = async (req: Request, res: Response) => {
    const [error, dto] = CreateMaterialDto.create(req.body);
    console.log(req.body);
    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const material = await new CreateMaterial(
        this.inventoryRepository
      ).execute(dto!);

      res.json(ResponseBuilder.success(material, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateMaterial = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [error, dto] = UpdateMaterialDto.create(req.body);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const material = await new UpdateMaterial(
        this.inventoryRepository
      ).execute(id, dto!);

      res.json(ResponseBuilder.success(material, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteMaterial = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res
        .status(400)
        .json(
          ResponseBuilder.error(400, "El ID del material no es válido", req)
        );
      return;
    }

    try {
      await new DeleteMaterial(this.inventoryRepository).execute(id);
      res.json(ResponseBuilder.success(true, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createMaterialCategory = async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "El nombre es requerido", req));
      return;
    }

    const category = await this.inventoryRepository.getMaterialCategoryByName(
      name
    );

    if (category)
      res
        .status(400)
        .json(ResponseBuilder.error(400, "La categoría ya existe", req));

    try {
      const category = await this.inventoryRepository.createMaterialCategory(
        name
      );
      res.json(ResponseBuilder.success(category, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  createMaterialUnit = async (req: Request, res: Response) => {
    const [error, dto] = CreateUnitDto.create(req.body);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const unit = await this.inventoryRepository.createUnit(dto!);
      res.json(ResponseBuilder.success(unit, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaterials = async (req: Request, res: Response) => {
    const [error, dto] = MaterialQueryDto.create(req.query);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { page, limit, ...filters } = dto!;
    const skip = (page - 1) * limit;

    try {
      const { materials, total } = await this.inventoryRepository.getMaterials(
        filters,
        limit,
        skip
      );

      const pagination = { limit, page, total };

      res.json(
        ResponseBuilder.successWithPagination(materials, pagination, req)
      );
    } catch (error) {}
  };

  getMaterialById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res
        .status(400)
        .json(
          ResponseBuilder.error(400, "El ID del material no es válido", req)
        );
      return;
    }
    const { moves } = req.query;
    const includeMoves = moves === "true";

    try {
      const material = await this.inventoryRepository.getMaterialById(
        id,
        includeMoves
      );
      res.json(ResponseBuilder.success(material, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getStockMoves = async (req: Request, res: Response) => {
    const [error, dto] = StockMoveQueryDto.create(req.query);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { page, limit, ...filters } = dto!;
    const skip = (page - 1) * limit;

    try {
      const { stockMoves, total } =
        await this.inventoryRepository.getStockMoves(filters, limit, skip);

      const pagination = { limit, page, total };

      res.json(
        ResponseBuilder.successWithPagination(stockMoves, pagination, req)
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getStockMoveById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Validators.isPositiveInteger(id)) {
      res
        .status(400)
        .json(
          ResponseBuilder.error(
            400,
            "El ID del movimiento de inventario no es válido",
            req
          )
        );
      return;
    }

    try {
      const stockMove = await this.inventoryRepository.getStockMoveById(id);
      res.json(ResponseBuilder.success(stockMove, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getUnits = async (req: Request, res: Response) => {
    try {
      const units = await this.inventoryRepository.getUnits();
      res.json(ResponseBuilder.success(units, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteUnit = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Validators.isPositiveInteger(id)) {
      res
        .status(400)
        .json(
          ResponseBuilder.error(400, "El ID de la unidad no es válido", req)
        );
      return;
    }

    try {
      await new DeleteUnit(this.inventoryRepository).execute(id);
      res.json(ResponseBuilder.success(true, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.inventoryRepository.getMaterialCategories();
      res.json(ResponseBuilder.success(categories, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteCategory = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Validators.isPositiveInteger(id)) {
      res
        .status(400)
        .json(
          ResponseBuilder.error(400, "El ID de la categoría no es válido", req)
        );
      return;
    }

    try {
      await new DeleteCategory(this.inventoryRepository).execute(id);
      res.json(ResponseBuilder.success(true, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
