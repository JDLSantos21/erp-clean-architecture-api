import { CreateProductDTO } from "../dtos";
import { Product } from "../entities";

export abstract class ProductDatasource {
  abstract create(data: CreateProductDTO): Promise<Product>;
}
