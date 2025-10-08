import { PrismaClient } from "@prisma/client";
import {
  CacheService,
  CreateProductDTO,
  CustomError,
  IntegerId,
  Product,
  ProductDatasource,
} from "../../domain";
import { OrderMapper } from "../mappers";
import { CacheTTL, CacheInvalidator, CacheKeyBuilder } from "../utils";

export class ProductDatasourceImpl extends ProductDatasource {
  private readonly cacheInvalidator: CacheInvalidator;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly cacheService: CacheService
  ) {
    super();
    this.cacheInvalidator = new CacheInvalidator(this.cacheService);
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const product = await this.prisma.product.create({
      data,
    });

    await this.cacheInvalidator.invalidateLists("product");

    const { id, ...rest } = product;

    const productEntity = new Product({
      id: IntegerId.create(id),
      ...rest,
    });

    return productEntity;
  }

  async update(
    id: IntegerId,
    data: Partial<CreateProductDTO>
  ): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id: id.value },
        data,
      });
      await this.cacheInvalidator.invalidateEntity("product", id.value);
      await this.cacheInvalidator.invalidateLists("product");
      return OrderMapper.productToDomain(product);
    } catch (error) {
      throw CustomError.internalServer("Error al actualizar el producto");
    }
  }

  async findOne(id: IntegerId): Promise<Product> {
    const { productToDomain } = OrderMapper;
    try {
      const cacheKey = CacheKeyBuilder.entity("product", id.value);
      const cached = await this.cacheService.get<Product>(cacheKey);
      if (cached) {
        return productToDomain(cached);
      }
      const product = await this.prisma.product.findUnique({
        where: { id: id.value },
      });

      if (!product) throw CustomError.notFound("Producto no encontrado");

      await this.cacheService.set(cacheKey, product, CacheTTL.STATIC);
      return productToDomain(product);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error al obtener el producto");
    }
  }

  async list(): Promise<Product[]> {
    const { productToDomain } = OrderMapper;
    try {
      const cacheKey = CacheKeyBuilder.list("product");
      const cached = await this.cacheService.get<Product[]>(cacheKey);
      if (cached) {
        return cached.map((p) => productToDomain(p));
      }
      const products = await this.prisma.product.findMany();
      await this.cacheService.set(cacheKey, products, CacheTTL.STATIC);
      return products.map((p) => productToDomain(p));
    } catch (error) {
      throw CustomError.internalServer("Error al listar los productos");
    }
  }

  async delete(id: IntegerId): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id: id.value },
      });
      await this.cacheInvalidator.invalidateEntity("product", id.value);
      await this.cacheInvalidator.invalidateLists("product");
    } catch (error) {
      throw CustomError.internalServer("Error al eliminar el producto");
    }
  }
}
