import { CreateProductDTO } from "../dtos";
import { Product } from "../entities";
import { IntegerId } from "../value-object";

export abstract class ProductDatasource {
  abstract create(data: CreateProductDTO): Promise<Product>;
  abstract findOne(id: IntegerId): Promise<Product>;
  abstract findOneByName(name: string): Promise<Product>;
  abstract list(): Promise<Product[]>;
  abstract delete(id: IntegerId): Promise<void>;
  abstract update(
    id: IntegerId,
    data: Partial<CreateProductDTO>
  ): Promise<Product>;
}
