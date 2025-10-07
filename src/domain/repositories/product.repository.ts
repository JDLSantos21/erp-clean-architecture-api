import { CreateProductDTO } from "../dtos";
import { Product } from "../entities";

export abstract class ProductRepository {
  abstract create(data: CreateProductDTO): Promise<Product>;
}
