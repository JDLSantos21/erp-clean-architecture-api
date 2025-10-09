import { Validators } from "../../../config";
import { IntegerId, UUID } from "../../value-object";

export class CreateEquipmentAssignmentDto {
  private constructor(
    public equipmentId: IntegerId,
    public customerId: IntegerId,
    public customerAddressId: IntegerId,
    public assignedBy: UUID,
    public notes?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: CreateEquipmentAssignmentDto] {
    const {
      equipment_id,
      customer_id,
      customer_address_id,
      assigned_by,
      notes,
    } = object;

    if (!equipment_id || !customer_id || !customer_address_id || !assigned_by) {
      return ["Faltan datos obligatorios"];
    }

    if (notes && !Validators.isValidString(notes))
      return ["Formato de las notas inválidas"];

    try {
      const equipmentId = IntegerId.create(equipment_id);
      const customerId = IntegerId.create(customer_id);
      const customerAddressId = IntegerId.create(customer_address_id);
      const assignedBy = UUID.create(assigned_by);

      return [
        undefined,
        new CreateEquipmentAssignmentDto(
          equipmentId,
          customerId,
          customerAddressId,
          assignedBy,
          notes
        ),
      ];
    } catch (error) {
      return [error as string, undefined];
    }
  }
}
