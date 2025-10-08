import { CustomError } from "../../..";
import { CreateProductDTO } from "../../../dtos";
import { Product } from "../../../entities";
import { ProductRepository } from "../../../repositories";

interface CreateProductUseCase {
  execute(data: CreateProductDTO): Promise<Product>;
}

export class CreateProduct implements CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(data: CreateProductDTO): Promise<Product> {
    const product = await this.productRepository.findOneByName(data.name);

    if (product)
      throw CustomError.conflict("Ya hiciste un producto con ese nombre");

    return this.productRepository.create(data);
  }
}
