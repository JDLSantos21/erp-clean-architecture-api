import {
  CreateProduct,
  CreateProductDTO,
  CustomError,
  DeleteProduct,
  IntegerId,
  ProductRepository,
  UpdateProduct,
} from "../../../domain";
import { Request, Response } from "express";
import { BaseController } from "../../shared/base.controller";
import { ProductResponseDto } from "../../dtos/order";

export class ProductController extends BaseController {
  constructor(
    private readonly createProductUseCase: CreateProduct,
    private readonly updateProductUseCase: UpdateProduct,
    private readonly deleteProductUseCase: DeleteProduct,
    private readonly productRepository: ProductRepository
  ) {
    super();
  }

  createProduct = async (req: Request, res: Response) => {
    const [error, dto] = CreateProductDTO.create(req.body);

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
      return;
    }

    try {
      const product = await this.createProductUseCase.execute(dto!);
      const productResponse = ProductResponseDto.fromEntity(product);
      this.handleSuccess(res, productResponse, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const [error, dto] = CreateProductDTO.create(req.body);

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
      return;
    }

    try {
      const product = await this.updateProductUseCase.execute(
        IntegerId.create(Number(id)),
        dto!
      );
      const productResponse = ProductResponseDto.fromEntity(product);
      this.handleSuccess(res, productResponse, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.productRepository.list();
      const productResponses = ProductResponseDto.fromEntities(products);
      this.handleSuccess(res, productResponses, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const product = await this.productRepository.findOne(
        IntegerId.create(Number(id))
      );
      const productResponse = ProductResponseDto.fromEntity(product);
      this.handleSuccess(res, productResponse, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await this.deleteProductUseCase.execute(IntegerId.create(Number(id)));
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
