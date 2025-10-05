import { CreateOrderDto } from "../create-order.dto";
import { IntegerId, UUID, FutureDate } from "../../../value-object";
import { CreateOrderItemDto } from "../create-order-item.dto";

describe("CreateOrderDto", () => {
  const validUserId = "550e8400-e29b-41d4-a716-446655440000";

  const validInput = {
    customer_id: 1,
    address_id: 1,
    order_items: [
      { product_id: 1, requested_quantity: 5 },
      { product_id: 2, requested_quantity: 3 },
    ],
  };

  describe("create - casos exitosos", () => {
    it("debe crear un DTO con campos mínimos requeridos", () => {
      const [error, dto] = CreateOrderDto.create(validInput, validUserId);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.customerId).toBeInstanceOf(IntegerId);
      expect(dto!.customerAddressId).toBeInstanceOf(IntegerId);
      expect(dto!.createdById).toBeInstanceOf(UUID);
      expect(dto!.orderItems).toHaveLength(2);
      expect(dto!.orderItems[0]).toBeInstanceOf(CreateOrderItemDto);
      expect(dto!.scheduledDate).toBeUndefined();
      expect(dto!.deliveryNotes).toBeUndefined();
      expect(dto!.notes).toBeUndefined();
    });

    it("debe crear un DTO con todos los campos opcionales", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const input = {
        ...validInput,
        scheduled_date: futureDate.toISOString(),
        delivery_notes: "Llamar antes de entregar",
        notes: "Cliente preferencial",
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.scheduledDate).toBeInstanceOf(FutureDate);
      expect(dto!.deliveryNotes).toBe("Llamar antes de entregar");
      expect(dto!.notes).toBe("Cliente preferencial");
    });

    it("debe normalizar strings eliminando espacios en blanco", () => {
      const input = {
        ...validInput,
        delivery_notes: "  Con espacios  ",
        notes: "  También con espacios  ",
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto!.deliveryNotes).toBe("Con espacios");
      expect(dto!.notes).toBe("También con espacios");
    });

    it("debe crear DTO con múltiples items de orden", () => {
      const input = {
        ...validInput,
        order_items: [
          { product_id: 1, requested_quantity: 5 },
          { product_id: 2, requested_quantity: 10 },
          { product_id: 3, requested_quantity: 2 },
        ],
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto!.orderItems).toHaveLength(3);
    });
  });

  describe("create - validaciones de campos requeridos", () => {
    it("debe retornar error si falta customer_id", () => {
      const input = {
        address_id: 1,
        order_items: validInput.order_items,
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("El ID del cliente es requerido");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si falta address_id", () => {
      const input = {
        customer_id: 1,
        order_items: validInput.order_items,
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("El ID de la dirección es requerido");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si falta userId", () => {
      const [error, dto] = CreateOrderDto.create(validInput, "");

      expect(error).toBe("El ID del usuario es requerido");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si order_items no es un array", () => {
      const input = {
        ...validInput,
        order_items: "not an array",
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("Debe agregar al menos un producto al pedido");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si order_items está vacío", () => {
      const input = {
        ...validInput,
        order_items: [],
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("Debe agregar al menos un producto al pedido");
      expect(dto).toBeUndefined();
    });
  });

  describe("create - validaciones de Value Objects", () => {
    it("debe retornar error si customer_id es inválido", () => {
      const input = {
        ...validInput,
        customer_id: -1,
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeDefined();
      expect(error).toContain("ID");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si address_id es inválido", () => {
      const input = {
        ...validInput,
        address_id: 0,
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si userId no es un UUID válido", () => {
      const [error, dto] = CreateOrderDto.create(validInput, "invalid-uuid");

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });
  });

  describe("create - validaciones de fecha programada", () => {
    it("debe retornar error si scheduled_date no es una fecha válida", () => {
      const input = {
        ...validInput,
        scheduled_date: "invalid-date",
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("La fecha no es válida");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si scheduled_date está en el pasado", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const input = {
        ...validInput,
        scheduled_date: pastDate.toISOString(),
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("La fecha no puede estar en el pasado");
      expect(dto).toBeUndefined();
    });

    it("debe aceptar scheduled_date de hoy", () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const input = {
        ...validInput,
        scheduled_date: today.toISOString(),
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto!.scheduledDate).toBeInstanceOf(FutureDate);
    });

    it("debe aceptar scheduled_date futura", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const input = {
        ...validInput,
        scheduled_date: futureDate.toISOString(),
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto!.scheduledDate).toBeInstanceOf(FutureDate);
    });
  });

  describe("create - validaciones de strings opcionales", () => {
    it("debe retornar error si delivery_notes no es string", () => {
      const input = {
        ...validInput,
        delivery_notes: 123,
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("Las notas de entrega deben ser texto");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si notes no es string", () => {
      const input = {
        ...validInput,
        notes: { text: "nota" },
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("Las notas deben ser texto");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si delivery_notes excede 1000 caracteres", () => {
      const input = {
        ...validInput,
        delivery_notes: "a".repeat(1001),
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe(
        "Las notas de entrega no pueden exceder 1000 caracteres"
      );
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si notes excede 1000 caracteres", () => {
      const input = {
        ...validInput,
        notes: "b".repeat(1001),
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBe("Las notas no pueden exceder 1000 caracteres");
      expect(dto).toBeUndefined();
    });

    it("debe aceptar delivery_notes con exactamente 1000 caracteres", () => {
      const input = {
        ...validInput,
        delivery_notes: "a".repeat(1000),
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
    });
  });

  describe("create - validaciones de items de orden", () => {
    it("debe retornar error si un item es inválido", () => {
      const input = {
        ...validInput,
        order_items: [
          { product_id: 1, requested_quantity: 5 },
          { product_id: 2, requested_quantity: -1 }, // inválido
        ],
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeDefined();
      expect(error).toContain("Ocurrió un error al agregar un producto");
      expect(dto).toBeUndefined();
    });

    it("debe indicar el número de item con error", () => {
      const input = {
        ...validInput,
        order_items: [
          { product_id: 1, requested_quantity: 5 },
          { product_id: 2, requested_quantity: 3 },
          { product_id: -1, requested_quantity: 2 }, // inválido
        ],
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeDefined();
      expect(error).toContain("Ocurrió un error al agregar un producto");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si falta product_id en un item", () => {
      const input = {
        ...validInput,
        order_items: [{ requested_quantity: 5 }],
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeDefined();
      expect(error).toContain("Ocurrió un error al agregar un producto");
      expect(dto).toBeUndefined();
    });
  });

  describe("create - casos límite", () => {
    it("debe manejar un solo item de orden", () => {
      const input = {
        ...validInput,
        order_items: [{ product_id: 1, requested_quantity: 1 }],
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto!.orderItems).toHaveLength(1);
    });

    it("debe manejar strings opcionales como undefined", () => {
      const input = {
        ...validInput,
        delivery_notes: undefined,
        notes: undefined,
        scheduled_date: undefined,
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto!.deliveryNotes).toBeUndefined();
      expect(dto!.notes).toBeUndefined();
      expect(dto!.scheduledDate).toBeUndefined();
    });

    it("debe convertir strings vacíos a undefined", () => {
      const input = {
        ...validInput,
        delivery_notes: "   ",
        notes: "   ",
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto!.deliveryNotes).toBeUndefined();
      expect(dto!.notes).toBeUndefined();
    });
  });

  describe("create - integración completa", () => {
    it("debe crear DTO con todos los campos válidos", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const input = {
        customer_id: 42,
        address_id: 15,
        scheduled_date: futureDate.toISOString(),
        delivery_notes: "Entregar en recepción",
        notes: "Cliente VIP",
        order_items: [
          { product_id: 1, requested_quantity: 10, notes: "Urgente" },
          { product_id: 2, requested_quantity: 5 },
          { product_id: 3, requested_quantity: 20, notes: "Frágil" },
        ],
      };

      const [error, dto] = CreateOrderDto.create(input, validUserId);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.customerId.value).toBe(42);
      expect(dto!.customerAddressId.value).toBe(15);
      expect(dto!.createdById.value).toBe(validUserId);
      expect(dto!.orderItems).toHaveLength(3);
      expect(dto!.scheduledDate).toBeInstanceOf(FutureDate);
      expect(dto!.deliveryNotes).toBe("Entregar en recepción");
      expect(dto!.notes).toBe("Cliente VIP");
    });
  });
});
