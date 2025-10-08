import { CustomError } from "../../../errors";
import { ProductRepository } from "../../../repositories";
import { IntegerId } from "../../../value-object";

interface DeleteProductUseCase {
  execute(id: IntegerId): Promise<void>;
}

export class DeleteProduct implements DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: IntegerId): Promise<void> {
    const product = await this.productRepository.findOne(id);

    if (!product) throw CustomError.notFound("Producto no encontrado");

    return this.productRepository.delete(id);
  }
}
