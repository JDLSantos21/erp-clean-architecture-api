import { Validators } from "../../../config";
import { DEFAULT_LIMIT, DEFAULT_PAGE, OrderStatusArray } from "../../constants";
import { OrderStatus } from "../../entities";
import { IntegerId, TrackingCode, UUID } from "../../value-object";

export class OrderQueryDto {
  constructor(
    public page: number,
    public limit: number,
    public orderId?: IntegerId,
    public trackingCode?: TrackingCode,
    public customerId?: UUID,
    public status?: string,
    public startDate?: Date,
    public endDate?: Date,
    public scheduledDate?: Date,
    public searchTerm?: string
  ) {}

  public static create(object: {
    [key: string]: any;
  }): [error?: string, OrderQueryDto?] {
    const {
      page,
      limit,
      order_id,
      tracking_code,
      customer_id,
      status,
      start_date,
      end_date,
      scheduled_date,
      search_term,
    } = object;

    const pageNumber = Number(page) || DEFAULT_PAGE;
    const limitNumber = Number(limit) || DEFAULT_LIMIT;

    if (pageNumber < 1 || !Number.isInteger(pageNumber)) {
      return ["El número de página no es válido"];
    }

    if (
      limitNumber < 1 ||
      limitNumber > 100 ||
      !Number.isInteger(limitNumber)
    ) {
      return ["El límite no es válido"];
    }

    if (order_id !== undefined) {
      if (!Validators.isPositiveInteger(order_id)) {
        return ["El ID del pedido debe ser un número entero positivo"];
      }
    }

    if (tracking_code !== undefined) {
      if (!TrackingCode.isValid(tracking_code)) {
        return ["El código de seguimiento es inválido"];
      }
    }

    if (customer_id !== undefined) {
      if (!Validators.uuid.test(customer_id)) {
        return ["El ID del cliente debe ser un UUID válido"];
      }
    }

    if (status !== undefined) {
      if (typeof status !== "string") {
        return ["El formato del estado es inválido"];
      }

      if (!OrderStatusArray.includes(status as OrderStatus)) {
        return [
          `El estado debe ser uno de los siguientes: ${OrderStatusArray.join(
            ", "
          )}`,
        ];
      }
    }

    if (start_date !== undefined) {
      const start = new Date(start_date);
      if (!Validators.isValidDate(start)) {
        return ["El formato de la fecha de inicio es inválido"];
      }
    }

    if (end_date !== undefined) {
      const end = new Date(end_date);
      if (!Validators.isValidDate(end)) {
        return ["El formato de la fecha de fin es inválido"];
      }
    }

    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (start > end) {
        return ["La fecha de inicio no puede ser mayor que la fecha de fin"];
      }
    }

    if (scheduled_date !== undefined) {
      const scheduled = new Date(scheduled_date);
      if (!Validators.isValidDate(scheduled)) {
        return ["El formato de la fecha programada es inválido"];
      }
    }

    if (search_term !== undefined) {
      if (typeof search_term !== "string") {
        return ["El término de búsqueda es inválido"];
      }
    }

    return [
      undefined,
      new OrderQueryDto(
        pageNumber,
        limitNumber,
        order_id ? IntegerId.create(order_id) : undefined,
        tracking_code ? TrackingCode.create(tracking_code) : undefined,
        customer_id ? UUID.create(customer_id) : undefined,
        status,
        start_date ? new Date(start_date) : undefined,
        end_date ? new Date(end_date) : undefined,
        scheduled_date ? new Date(scheduled_date) : undefined,
        search_term ? search_term.trim() : undefined
      ),
    ];
  }
}
