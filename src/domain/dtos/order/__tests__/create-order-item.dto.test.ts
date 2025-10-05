import { CreateOrderItemDto } from "../create-order-item.dto";
import { IntegerId } from "../../../value-object";

describe("CreateOrderItemDto", () => {
  describe("create - casos exitosos", () => {
    it("debe crear un DTO con campos requeridos", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.productId).toBeInstanceOf(IntegerId);
      expect(dto!.productId.value).toBe(1);
      expect(dto!.requestedQuantity).toBe(5);
      expect(dto!.notes).toBeUndefined();
    });

    it("debe crear un DTO con notas opcionales", () => {
      const input = {
        product_id: 10,
        requested_quantity: 3,
        notes: "Producto frágil",
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto!.notes).toBe("Producto frágil");
    });

    it("debe eliminar espacios en blanco de las notas", () => {
      const input = {
        product_id: 1,
        requested_quantity: 1,
        notes: "  Con espacios  ",
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto!.notes).toBe("Con espacios");
    });

    it("debe aceptar cantidad grande pero dentro del límite", () => {
      const input = {
        product_id: 1,
        requested_quantity: 9999,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto!.requestedQuantity).toBe(9999);
    });
  });

  describe("create - validaciones de campos requeridos", () => {
    it("debe retornar error si falta product_id", () => {
      const input = {
        requested_quantity: 5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("El ID del producto es requerido");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si product_id es null", () => {
      const input = {
        product_id: null,
        requested_quantity: 5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("El ID del producto es requerido");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si falta requested_quantity", () => {
      const input = {
        product_id: 1,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("La cantidad solicitada es requerida");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si requested_quantity es null", () => {
      const input = {
        product_id: 1,
        requested_quantity: null,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("La cantidad solicitada es requerida");
      expect(dto).toBeUndefined();
    });
  });

  describe("create - validaciones de cantidad", () => {
    it("debe retornar error si requested_quantity no es un número", () => {
      const input = {
        product_id: 1,
        requested_quantity: "5",
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("La cantidad solicitada debe ser un número");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si requested_quantity no es entero", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5.5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("La cantidad solicitada debe ser un número entero");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si requested_quantity es cero", () => {
      const input = {
        product_id: 1,
        requested_quantity: 0,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("La cantidad solicitada debe ser mayor a 0");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si requested_quantity es negativo", () => {
      const input = {
        product_id: 1,
        requested_quantity: -5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("La cantidad solicitada debe ser mayor a 0");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si requested_quantity excede el límite", () => {
      const input = {
        product_id: 1,
        requested_quantity: 10001,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe(
        "La cantidad solicitada no puede exceder 10,000 unidades"
      );
      expect(dto).toBeUndefined();
    });
  });

  describe("create - validaciones de product_id (Value Object)", () => {
    it("debe retornar error si product_id no es un número", () => {
      const input = {
        product_id: "abc",
        requested_quantity: 5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeDefined();
      expect(error).toContain("ID");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si product_id es cero", () => {
      const input = {
        product_id: 0,
        requested_quantity: 5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si product_id es negativo", () => {
      const input = {
        product_id: -1,
        requested_quantity: 5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si product_id no es entero", () => {
      const input = {
        product_id: 1.5,
        requested_quantity: 5,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });
  });

  describe("create - validaciones de notas opcionales", () => {
    it("debe retornar error si notes no es un string", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5,
        notes: 123,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("Las notas deben ser texto");
      expect(dto).toBeUndefined();
    });

    it("debe retornar error si notes excede el límite de caracteres", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5,
        notes: "a".repeat(501),
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBe("Las notas no pueden exceder 500 caracteres");
      expect(dto).toBeUndefined();
    });

    it("debe aceptar notas con exactamente 500 caracteres", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5,
        notes: "a".repeat(500),
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
    });

    it("debe convertir notas undefined en undefined", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5,
        notes: undefined,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto!.notes).toBeUndefined();
    });
  });

  describe("create - casos límite", () => {
    it("debe manejar cantidad mínima válida (1)", () => {
      const input = {
        product_id: 1,
        requested_quantity: 1,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto!.requestedQuantity).toBe(1);
    });

    it("debe manejar cantidad máxima válida (10000)", () => {
      const input = {
        product_id: 1,
        requested_quantity: 10000,
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto!.requestedQuantity).toBe(10000);
    });

    it("debe manejar notas vacías (string vacío)", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5,
        notes: "",
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto!.notes).toBeUndefined();
    });

    it("debe manejar notas con solo espacios", () => {
      const input = {
        product_id: 1,
        requested_quantity: 5,
        notes: "   ",
      };

      const [error, dto] = CreateOrderItemDto.create(input);

      expect(error).toBeUndefined();
      expect(dto!.notes).toBeUndefined();
    });
  });
});
