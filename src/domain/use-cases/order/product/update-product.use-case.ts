import { CreateProductDTO } from "../../../dtos";
import { Product } from "../../../entities";
import { CustomError } from "../../../errors";
import { ProductRepository } from "../../../repositories";
import { IntegerId } from "../../../value-object";

interface UpdateProductUseCase {
  execute(id: IntegerId, data: Partial<CreateProductDTO>): Promise<Product>;
}

export class UpdateProduct implements UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    id: IntegerId,
    data: Partial<CreateProductDTO>
  ): Promise<Product> {
    const product = await this.productRepository.findOne(id);

    if (!product) throw CustomError.notFound("Producto no encontrado");

    return this.productRepository.update(id, data);
  }
}
