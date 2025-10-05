import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  OrderStatusArray,
} from "../../../constants";
import { OrderStatus } from "../../../entities/order/Order";
import { TrackingCode } from "../../../value-object";
import { OrderQueryDto } from "../order-query.dto";

describe("OrderQueryDto", () => {
  const validInput = {
    order_id: 123,
    tracking_code: TrackingCode.generate().value,
    customer_id: "550e8400-e29b-41d4-a716-446655440000",
    status: "PENDIENTE",
    start_date: "2023-10-01",
    end_date: "2023-10-31",
    scheduled_date: "2023-11-05",
    page: 2,
    limit: 20,
  };

  describe("Casos exitosos", () => {
    it("Exito: Devolver DTO correctamente con datos válidos", () => {
      const [error, dto] = OrderQueryDto.create(validInput);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.orderId!.value).toBe(validInput.order_id);
      expect(dto!.trackingCode!.value).toBe(validInput.tracking_code);
      expect(dto!.customerId!.value).toBe(validInput.customer_id);
      expect(dto!.status).toBe(validInput.status);
      expect(dto!.startDate).toEqual(new Date(validInput.start_date));
      expect(dto!.endDate).toEqual(new Date(validInput.end_date));
      expect(dto!.scheduledDate).toEqual(new Date(validInput.scheduled_date));
      expect(dto!.page).toBe(validInput.page);
      expect(dto!.limit).toBe(validInput.limit);
    });

    it("Exito: Valores por defecto para page y limit", () => {
      const input = {
        order_id: 1,
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.page).toBe(DEFAULT_PAGE);
      expect(dto!.limit).toBe(DEFAULT_LIMIT);
    });

    it("Exito: page es cero, usa DEFAULT_PAGE", () => {
      const input = { ...validInput, page: 0 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.page).toBe(DEFAULT_PAGE);
    });

    it("Exito: page no es un número, usar DEFAULT_PAGE", () => {
      const input = { ...validInput, page: "abc" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.page).toBe(DEFAULT_PAGE);
    });

    it("Exito: limit es cero, usa DEFAULT_LIMIT", () => {
      const input = { ...validInput, limit: 0 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.limit).toBe(DEFAULT_LIMIT);
    });

    it("Exito: limit no es un número, usar DEFAULT_LIMIT", () => {
      const input = { ...validInput, limit: "abc" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.limit).toBe(DEFAULT_LIMIT);
    });

    it("Exito: Aceptar solo order_id", () => {
      const input = {
        order_id: 456,
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.orderId!.value).toBe(456);
    });

    it("Exito: Aceptar solo tracking_code", () => {
      const code = TrackingCode.generate().value;
      const input = {
        tracking_code: code,
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.trackingCode!.value).toBe(code);
    });

    it("Exito: Aceptar solo customer_id", () => {
      const input = {
        customer_id: "550e8400-e29b-41d4-a716-446655440000",
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.customerId!.value).toBe(input.customer_id);
    });

    it("Exito: Aceptar solo status", () => {
      const input = {
        status: "PREPARANDO",
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.status).toBe(input.status);
    });

    it("Exito: Aceptar solo fechas", () => {
      const input = {
        start_date: "2023-10-01",
        end_date: "2023-10-31",
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.startDate).toEqual(new Date(input.start_date));
      expect(dto!.endDate).toEqual(new Date(input.end_date));
    });

    it("Exito: Aceptar solo scheduled_date", () => {
      const input = {
        scheduled_date: "2023-11-05",
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(OrderQueryDto);
      expect(dto!.scheduledDate).toEqual(new Date(input.scheduled_date));
    });

    it("Exito: Recortar espacios en tracking_code", () => {
      const code = TrackingCode.generate().value;
      const input = {
        tracking_code: `  ${code}  `,
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBeUndefined();
      expect(dto!.trackingCode!.value).toBe(code);
      expect(dto).toBeInstanceOf(OrderQueryDto);
    });
  });

  describe("Casos de error", () => {
    it("Error: page es negativo", () => {
      const input = { ...validInput, page: -1 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El número de página no es válido");
      expect(dto).toBeUndefined();
    });

    it("Error: page no es entero", () => {
      const input = { ...validInput, page: 1.5 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El número de página no es válido");
      expect(dto).toBeUndefined();
    });

    it("Error: limit es negativo", () => {
      const input = { ...validInput, limit: -5 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El límite no es válido");
      expect(dto).toBeUndefined();
    });

    it("Error: limit no es entero", () => {
      const input = { ...validInput, limit: 10.5 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El límite no es válido");
      expect(dto).toBeUndefined();
    });

    it("Error: limit excede el máximo permitido", () => {
      const input = { ...validInput, limit: 150 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El límite no es válido");
      expect(dto).toBeUndefined();
    });

    it("Error: order_id no es un entero positivo", () => {
      const input = { ...validInput, order_id: -10 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El ID del pedido debe ser un número entero positivo");
      expect(dto).toBeUndefined();
    });

    it("Error: tracking_code inválido", () => {
      const input = { ...validInput, tracking_code: "INVALID" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El código de seguimiento es inválido");
      expect(dto).toBeUndefined();
    });
    it("Error: customer_id no es un UUID válido", () => {
      const input = { ...validInput, customer_id: "12345" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El ID del cliente debe ser un UUID válido");
      expect(dto).toBeUndefined();
    });

    it("Error: status no es un string", () => {
      const input = { ...validInput, status: 123 };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El formato del estado es inválido");
      expect(dto).toBeUndefined();
    });

    it("Error: status no es un estado válido", () => {
      const input = { ...validInput, status: "INVALID_STATUS" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe(
        `El estado debe ser uno de los siguientes: ${OrderStatusArray.join(
          ", "
        )}`
      );
      expect(dto).toBeUndefined();
    });

    it("Error: start_date no es una fecha válida", () => {
      const input = { ...validInput, start_date: "2023-13-01" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El formato de la fecha de inicio es inválido");
      expect(dto).toBeUndefined();
    });

    it("Error: end_date no es una fecha válida", () => {
      const input = { ...validInput, end_date: "invalid-date" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El formato de la fecha de fin es inválido");
      expect(dto).toBeUndefined();
    });

    it("Error: scheduled_date no es una fecha válida", () => {
      const input = { ...validInput, scheduled_date: "2023-02-35" };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe("El formato de la fecha programada es inválido");
      expect(dto).toBeUndefined();
    });

    it("Error: start_date es mayor que end_date", () => {
      const input = {
        ...validInput,
        start_date: "2023-11-01",
        end_date: "2023-10-01",
      };
      const [error, dto] = OrderQueryDto.create(input);
      expect(error).toBe(
        "La fecha de inicio no puede ser mayor que la fecha de fin"
      );
      expect(dto).toBeUndefined();
    });
  });
});
