import {
  CreateProductDTO,
  IntegerId,
  Product,
  ProductDatasource,
  ProductRepository,
} from "../../domain";

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly datasource: ProductDatasource) {}

  create(data: CreateProductDTO): Promise<Product> {
    return this.datasource.create(data);
  }

  update(id: IntegerId, data: Partial<CreateProductDTO>): Promise<Product> {
    return this.datasource.update(id, data);
  }

  findOne(id: IntegerId): Promise<Product> {
    return this.datasource.findOne(id);
  }

  findOneByName(name: string): Promise<Product | null> {
    return this.datasource.findOneByName(name);
  }

  list(): Promise<Product[]> {
    return this.datasource.list();
  }

  delete(id: IntegerId): Promise<void> {
    return this.datasource.delete(id);
  }
}
