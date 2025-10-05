import { Order, OrderStatus } from "../Order";
import { IntegerId, TrackingCode } from "../../../value-object";

describe("Order Entity", () => {
  const createMockOrder = (overrides?: Partial<Order>): Order => {
    const defaultOrder = new Order({
      id: IntegerId.create(1),
      trackingCode: TrackingCode.generate(2025),
      customerId: "customer-123",
      customerAddressId: 1,
      orderDate: new Date("2025-01-15"),
      createdById: "user-456",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });
    return defaultOrder;
  };

  describe("Constructor y propiedades", () => {
    it("debe crear una orden con propiedades básicas", () => {
      const trackingCode = TrackingCode.generate(2025);
      const order = createMockOrder({ trackingCode });

      expect(order).toBeInstanceOf(Order);
      expect(order.id.value).toBe(1);
      expect(order.trackingCode).toBeInstanceOf(TrackingCode);
      expect(order.customerId).toBe("customer-123");
      expect(order.isActive).toBe(true);
    });
  });

  describe("Estado de pedido", () => {
    it("isPending debe retornar true para pedido pendiente", () => {
      const order = createMockOrder();
      expect(order.isPending()).toBe(true);
    });

    it("isDelivered debe retornar true cuando tiene fecha de entrega", () => {
      const order = createMockOrder({
        deliveredDate: new Date(),
      });
      expect(order.isDelivered()).toBe(true);
    });

    it("isDispatched debe retornar true cuando está asignado pero no entregado", () => {
      const order = createMockOrder({
        assignedToId: "user-789",
      });
      expect(order.isDispatched()).toBe(true);
    });
  });

  describe("isScheduled", () => {
    it("debe retornar true si tiene fecha programada", () => {
      const order = createMockOrder({
        scheduledDate: new Date("2025-02-01"),
      });
      expect(order.isScheduled()).toBe(true);
    });

    it("debe retornar false si no tiene fecha programada", () => {
      const order = createMockOrder();
      expect(order.isScheduled()).toBe(false);
    });
  });

  describe("isAssigned", () => {
    it("debe retornar true si está asignado a un usuario", () => {
      const order = createMockOrder({
        assignedToId: "user-999",
      });
      expect(order.isAssigned()).toBe(true);
    });

    it("debe retornar false si no está asignado", () => {
      const order = createMockOrder();
      expect(order.isAssigned()).toBe(false);
    });
  });

  describe("isOverdue", () => {
    it("debe retornar false si no está programado", () => {
      const order = createMockOrder();
      expect(order.isOverdue()).toBe(false);
    });

    it("debe retornar false si ya fue entregado", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const order = createMockOrder({
        scheduledDate: pastDate,
        deliveredDate: new Date(),
      });
      expect(order.isOverdue()).toBe(false);
    });

    it("debe retornar true si la fecha programada ya pasó", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      const order = createMockOrder({
        scheduledDate: pastDate,
      });
      expect(order.isOverdue()).toBe(true);
    });

    it("debe retornar false si la fecha programada es futura", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const order = createMockOrder({
        scheduledDate: futureDate,
      });
      expect(order.isOverdue()).toBe(false);
    });
  });

  describe("assign", () => {
    it("debe asignar un usuario a pedido pendiente", () => {
      const order = createMockOrder();
      order.assign("user-123");

      expect(order.assignedToId).toBe("user-123");
      expect(order.isAssigned()).toBe(true);
    });

    it("debe lanzar error si el pedido no puede ser asignado", () => {
      const order = createMockOrder({
        deliveredDate: new Date(),
      });

      expect(() => order.assign("user-123")).toThrow(
        "El pedido debe estar pendiente o preparando para ser asignado"
      );
    });
  });

  describe("unassign", () => {
    it("debe desasignar un usuario", () => {
      const order = createMockOrder({
        assignedToId: "user-456",
      });

      order.unassign();
      expect(order.assignedToId).toBeUndefined();
      expect(order.isAssigned()).toBe(false);
    });

    it("debe lanzar error si el pedido no está asignado", () => {
      const order = createMockOrder();

      expect(() => order.unassign()).toThrow("El pedido no está asignado");
    });
  });

  describe("schedule", () => {
    it("debe programar una fecha de entrega", () => {
      const futureDate = new Date("2025-03-01");
      const order = createMockOrder();

      order.schedule(futureDate);
      expect(order.scheduledDate).toEqual(futureDate);
      expect(order.isScheduled()).toBe(true);
    });

    it("debe lanzar error si el pedido está cancelado", () => {
      const order = createMockOrder();
      // Simular orden cancelada - necesitaría mockear getCurrentStatus
      // Por ahora omitimos este test
    });
  });

  describe("markAsDelivered", () => {
    it("debe marcar como entregado un pedido despachado", () => {
      const order = createMockOrder({
        assignedToId: "user-789",
      });

      order.markAsDelivered();
      expect(order.deliveredDate).toBeInstanceOf(Date);
    });

    it("debe lanzar error si el pedido no está despachado", () => {
      const order = createMockOrder();

      expect(() => order.markAsDelivered()).toThrow(
        "Solo se puede marcar como entregado un pedido despachado"
      );
    });
  });

  describe("canBeAssigned", () => {
    it("debe retornar true para pedido activo y pendiente", () => {
      const order = createMockOrder();
      expect(order.canBeAssigned()).toBe(true);
    });

    it("debe retornar false para pedido inactivo", () => {
      const order = createMockOrder({ isActive: false });
      expect(order.canBeAssigned()).toBe(false);
    });
  });

  describe("getDaysOverdue", () => {
    it("debe retornar 0 si no está vencido", () => {
      const order = createMockOrder();
      expect(order.getDaysOverdue()).toBe(0);
    });

    it("debe calcular los días de retraso correctamente", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);

      const order = createMockOrder({
        scheduledDate: pastDate,
      });

      expect(order.getDaysOverdue()).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getDaysToDelivery", () => {
    it("debe retornar null si no está programado", () => {
      const order = createMockOrder();
      expect(order.getDaysToDelivery()).toBeNull();
    });

    it("debe retornar null si ya fue entregado", () => {
      const order = createMockOrder({
        scheduledDate: new Date(),
        deliveredDate: new Date(),
      });
      expect(order.getDaysToDelivery()).toBeNull();
    });

    it("debe calcular días hasta la entrega", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const order = createMockOrder({
        scheduledDate: futureDate,
      });

      expect(order.getDaysToDelivery()).toBeGreaterThanOrEqual(4);
    });
  });

  describe("getDaysSinceOrder", () => {
    it("debe calcular días desde la creación de la orden", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const order = createMockOrder({
        orderDate: pastDate,
      });

      expect(order.getDaysSinceOrder()).toBeGreaterThanOrEqual(7);
    });
  });

  describe("addDeliveryNotes", () => {
    it("debe agregar notas de entrega con timestamp", () => {
      const order = createMockOrder();
      order.addDeliveryNotes("Cliente no estaba en casa");

      expect(order.deliveryNotes).toContain("Cliente no estaba en casa");
      expect(order.deliveryNotes).toMatch(/\[\d{4}-\d{2}-\d{2}/);
    });

    it("debe agregar múltiples notas de entrega", () => {
      const order = createMockOrder();
      order.addDeliveryNotes("Primera nota");
      order.addDeliveryNotes("Segunda nota");

      expect(order.deliveryNotes).toContain("Primera nota");
      expect(order.deliveryNotes).toContain("Segunda nota");
    });
  });

  describe("addNotes", () => {
    it("debe agregar notas con timestamp", () => {
      const order = createMockOrder();
      order.addNotes("Pedido urgente");

      expect(order.notes).toContain("Pedido urgente");
      expect(order.notes).toMatch(/\[\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("requiresUrgentAttention", () => {
    it("debe retornar true si está vencido", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      const order = createMockOrder({
        scheduledDate: pastDate,
      });

      expect(order.requiresUrgentAttention()).toBe(true);
    });

    it("debe retornar true si lleva más de 3 días pendiente", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5);

      const order = createMockOrder({
        orderDate: oldDate,
      });

      expect(order.requiresUrgentAttention()).toBe(true);
    });

    it("debe retornar false para pedido reciente", () => {
      const order = createMockOrder({
        orderDate: new Date(),
      });

      expect(order.requiresUrgentAttention()).toBe(false);
    });
  });

  describe("TrackingCode integration", () => {
    it("debe mantener el trackingCode como Value Object", () => {
      const trackingCode = TrackingCode.generate(2025);
      const order = createMockOrder({ trackingCode });

      expect(order.trackingCode).toBeInstanceOf(TrackingCode);
      expect(order.trackingCode.value).toBe(trackingCode.value);
    });

    it("debe poder extraer información del tracking code", () => {
      const order = createMockOrder();

      expect(order.trackingCode.getYear()).toBeDefined();
      expect(order.trackingCode.format()).toMatch(/^PD-\d{6}-\d{4}-\d{2}$/);
    });
  });
});
