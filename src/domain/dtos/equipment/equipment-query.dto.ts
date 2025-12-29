import { Validators } from "../../../config";
import { DEFAULT_LIMIT, DEFAULT_PAGE, EQUIPMENT_STATUS } from "../../constants";
import { EquipmentStatus } from "../../entities";
import { EquipmentSerialNumber, IntegerId, UUID } from "../../value-object";

export class EquipmentQueryDto {
  private constructor(
    public page: number,
    public limit: number,
    public modelId?: IntegerId,
    public serialNumber?: EquipmentSerialNumber,
    public customerId?: UUID,
    public status?: EquipmentStatus,
    public customerName?: string,
    public search?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, EquipmentQueryDto?] {
    const {
      model_id,
      serial_number,
      status,
      customer_id,
      customer_name,
      search,
      page,
      limit,
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

    if (customer_name && !Validators.isValidString(customer_name)) {
      return ["El nombre del cliente no es válido"];
    }

    if (
      status &&
      EQUIPMENT_STATUS[status as keyof typeof EQUIPMENT_STATUS] === undefined
    ) {
      return ["El estado especificado no es válido"];
    }

    if (search && !Validators.isValidString(search)) {
      return ["La búsqueda especificada no es válida"];
    }

    try {
      const modelId = model_id ? IntegerId.create(model_id) : undefined;
      const serialNumber = serial_number
        ? EquipmentSerialNumber.create(serial_number)
        : undefined;
      const customerId = customer_id ? UUID.create(customer_id) : undefined;

      return [
        undefined,
        new EquipmentQueryDto(
          pageNumber,
          limitNumber,
          modelId,
          serialNumber,
          customerId,
          status,
          customer_name ? customer_name.trim() : undefined,
          search ? search.trim() : undefined
        ),
      ];
    } catch (error: any) {
      return [error.message];
    }
  }
}
