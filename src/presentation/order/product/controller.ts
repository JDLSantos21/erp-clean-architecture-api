import {
  CreateProduct,
  CreateProductDTO,
  CustomError,
  ProductRepository,
} from "../../../domain";
import { Request, Response } from "express";
import { BaseController } from "../../shared/base.controller";

export class ProductController extends BaseController {
  constructor(
    private readonly createProductUseCase: CreateProduct,
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
      this.handleSuccess(res, product, req);
    } catch (error) {
      console.log(error);
      this.handleError(error, res, req);
    }
  };
}
