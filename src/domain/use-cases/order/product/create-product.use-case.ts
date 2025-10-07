import { CreateProductDTO } from "../../../dtos";
import { Product } from "../../../entities";
import { ProductRepository } from "../../../repositories";

interface CreateProductUseCase {
  execute(data: CreateProductDTO): Promise<Product>;
}

export class CreateProduct implements CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(data: CreateProductDTO): Promise<Product> {
    return this.productRepository.create(data);
  }
}
