import { PrismaClient } from "@prisma/client";
import {
  CreateProductDTO,
  IntegerId,
  Product,
  ProductDatasource,
} from "../../domain";

export class ProductDatasourceImpl extends ProductDatasource {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const product = await this.prisma.product.create({
      data,
    });

    const { id, ...rest } = product;

    const productEntity = new Product({
      id: IntegerId.create(id),
      ...rest,
    });

    return productEntity;
  }
}
