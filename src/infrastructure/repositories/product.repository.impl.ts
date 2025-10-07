import {
  CreateProductDTO,
  Product,
  ProductDatasource,
  ProductRepository,
} from "../../domain";

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly datasource: ProductDatasource) {}

  create(data: CreateProductDTO): Promise<Product> {
    return this.datasource.create(data);
  }
}
