import { prisma } from "../../../data/postgresql/config";
import { IntegerId, Logger, TrackingCode, UUID } from "../../../domain";
import { OrderDatasourceImpl } from "../order.datasource.impl";

describe("OrderDatasourceImpl", () => {
  it("order creation and retrieval", async () => {
    const orderDatasource = new OrderDatasourceImpl(prisma);

    const newOrder = await orderDatasource.create({
      trackingCode: TrackingCode.generate().value,
      createdById: UUID.create("550e8400-e29b-41d4-a716-446655440000"),
      customerId: UUID.create("660e8400-e29b-41d4-a716-446655440000"),
      customerAddressId: IntegerId.create(1),
      orderItems: [
        {
          productId: IntegerId.create(1),
          requestedQuantity: 2,
          notes: "Please handle with care",
        },
      ],
    });

    Logger.info("Created Order:", newOrder);
  });
});
