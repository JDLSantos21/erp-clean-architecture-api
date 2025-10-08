import { CreateProductDTO } from "../dtos";
import { Product } from "../entities";
import { IntegerId } from "../value-object";

export abstract class ProductRepository {
  abstract create(data: CreateProductDTO): Promise<Product>;
  abstract findOne(id: IntegerId): Promise<Product>;
  abstract list(): Promise<Product[]>;
  abstract delete(id: IntegerId): Promise<void>;
  abstract update(
    id: IntegerId,
    data: Partial<CreateProductDTO>
  ): Promise<Product>;
}
