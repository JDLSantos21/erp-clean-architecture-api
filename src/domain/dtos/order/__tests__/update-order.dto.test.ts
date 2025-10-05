import { UpdateOrderDto } from "../update-order.dto";

describe("UpdateOrderDto", () => {
  const DAY_IN_MS = 24 * 60 * 60 * 1000;

  const validInput = {
    orderId: 123,
    order_items: [
      {
        product_id: 1,
        requested_quantity: 222,
        notes: "Sin gluten",
      },
    ],
    scheduled_date: new Date(Date.now() + DAY_IN_MS), // Mañana
    delivery_notes: "Por favor, entregar en la oficina principal.",
  };

  describe("Casos exitosos", () => {
    it("debe crear el DTO correctamente con datos válidos", () => {
      const [error, dto] = UpdateOrderDto.create(validInput);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.orderId.value).toBe(123);
      expect(dto!.orderItems!.length).toBe(1);
      expect(dto!.deliveryNotes).toBe(
        "Por favor, entregar en la oficina principal."
      );
      expect(dto!.notes).toBeUndefined();
      expect(dto!.scheduledDate!.value).toBeInstanceOf(Date);
    });

    it("debe crear el DTO con múltiples items", () => {
      const input = {
        orderId: 789,
        order_items: [
          { product_id: 1, requested_quantity: 5 },
          { product_id: 2, requested_quantity: 10, notes: "Urgente        " },
        ],
        notes: "Llamar antes de entregar.",
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.orderId.value).toBe(789);
      expect(dto!.orderItems!.length).toBe(2);
      expect(dto!.orderItems![0].productId.value).toBe(1);
      expect(dto!.orderItems![0].requestedQuantity).toBe(5);
      expect(dto!.orderItems![0].notes).toBeUndefined();
      expect(dto!.orderItems![1].productId.value).toBe(2);
      expect(dto!.orderItems![1].requestedQuantity).toBe(10);
      expect(dto!.orderItems![1].notes).toBe("Urgente");
      expect(dto!.notes).toBe("Llamar antes de entregar.");
    });

    it("debe recortar espacios en notas", () => {
      const input = {
        orderId: 101,
        order_items: [
          {
            product_id: 3,
            requested_quantity: 15,
            notes: "  con espacios  ",
          },
        ],
        delivery_notes: "  entregar en recepción  ",
      };
      const [error, dto] = UpdateOrderDto.create(input);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.orderItems![0].notes).toBe("con espacios");
      expect(dto!.deliveryNotes).toBe("entregar en recepción");
    });

    it("debe aceptar cantidad grande pero dentro del límite", () => {
      const input = {
        orderId: 202,
        order_items: [
          {
            product_id: 4,
            requested_quantity: 10000,
          },
        ],
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.orderItems![0].requestedQuantity).toBe(10000);
    });

    it("debe crear el DTO sin order_items si no se proporcionan", () => {
      const input = {
        orderId: 456,
        delivery_notes: "Dejar en la puerta si no hay nadie.",
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.orderId.value).toBe(456);
      expect(dto!.orderItems).toBeUndefined();
      expect(dto!.deliveryNotes).toBe("Dejar en la puerta si no hay nadie.");
    });

    it("Notas deben ser undefined si no se proporcionan", () => {
      const input = {
        orderId: 456,
        delivery_notes: "      ",
        order_items: [{ product_id: 1, requested_quantity: 5 }],
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.orderId.value).toBe(456);
      expect(dto!.notes).toBeUndefined();
      expect(dto!.deliveryNotes).toBeUndefined();
      expect(dto!.scheduledDate).toBeUndefined();
    });
  });

  describe("Casos de error", () => {
    it("Fallar: no se proporciono ninguun campo para actualizar", () => {
      const input = {
        orderId: 123,
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBe("Debe haber al menos un campo para actualizar");
      expect(dto).toBeUndefined();
    });

    it("Fallar: no se proporciono el ID del pedido", () => {
      const { orderId, ...input } = validInput;

      const [error, dto] = UpdateOrderDto.create(input);

      expect(error).toBe("El ID del pedido es requerido");
      expect(dto).toBeUndefined();
    });

    it("Fallar: El id del pedido no puede ser null", () => {
      const input = {
        ...validInput,
        orderId: null,
      };
      const [error, dto] = UpdateOrderDto.create(input);

      expect(error).toBe("El ID del pedido es requerido");
      expect(dto).toBeUndefined();
    });

    it("Fallar: order_items no es un array", () => {
      const input = {
        ...validInput,
        order_items: "no es un arreglo",
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBe("El formato de los productos del pedido es inválido");
      expect(dto).toBeUndefined();
    });

    it("Fallar: error al crear un item del pedido", () => {
      const input = {
        ...validInput,
        order_items: [
          {
            product_id: 1,
            requested_quantity: -5,
          },
        ],
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBe("Ocurrió un error al agregar un producto");
      expect(dto).toBeUndefined();
    });

    it("Fallar: error inesperado al crear el DTO", () => {
      const input = {
        ...validInput,
        orderId: "invalid-id",
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBeDefined();
      expect(error).toBe("El ID debe ser un número");
      expect(dto).toBeUndefined();
    });

    it("Fallar: requested_quantity excede el máximo permitido", () => {
      const input = {
        ...validInput,
        order_items: [
          {
            product_id: 1,
            requested_quantity: 10001,
          },
        ],
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("Fallar: scheduled_date en el pasado", () => {
      const input = {
        ...validInput,
        scheduled_date: new Date(Date.now() - DAY_IN_MS),
      };
      const [error, dto] = UpdateOrderDto.create(input);
      expect(error).toBe("La fecha no puede estar en el pasado");
      expect(dto).toBeUndefined();
    });
  });
});
