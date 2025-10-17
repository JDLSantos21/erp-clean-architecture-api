import { EQUIPMENT_STATUS } from "../../constants";
import { EquipmentStatus } from "../../entities";
import { IntegerId, UUID } from "../../value-object";

export class CreateEquipmentDto {
  private constructor(
    public modelId: IntegerId,
    public customerId?: UUID,
    public status?: EquipmentStatus
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateEquipmentDto?] {
    const { model_id, customer_id, status } = object;

    if (!model_id) {
      return ["El modelo del equipo es requerido", undefined];
    }

    const equipmentStatus =
      status !== undefined
        ? EQUIPMENT_STATUS[status as keyof typeof EQUIPMENT_STATUS]
        : undefined;

    if (status !== undefined && !equipmentStatus) {
      return ["El estado del equipo es inválido", undefined];
    }

    try {
      const modelId = IntegerId.create(model_id);
      const customerId =
        customer_id !== undefined ? UUID.create(customer_id) : undefined;

      return [
        undefined,
        new CreateEquipmentDto(modelId, customerId, equipmentStatus),
      ];
    } catch (error: any) {
      return [error.message];
    }
  }
}
