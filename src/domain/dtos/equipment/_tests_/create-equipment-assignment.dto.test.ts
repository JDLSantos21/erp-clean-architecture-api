import { CreateEquipmentAssignmentDto } from "../create-equipment-assignment.dto";

describe("CreateEquipmentAssigmentDto", () => {
  const validData = {
    equipmnt_id: 1,
    customer_id: 1,
    customer_address_id: 1,
    assigned_by: "550e8400-e29b-41d4-a716-446655440000",
    notes: "Some notes",
  };

  describe("create", () => {
    it("Deberia crear un DTO valido", () => {
      const [error, dto] = CreateEquipmentAssignmentDto.create(validData);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.equipmentId.value).toBe(validData.equipmnt_id);
      expect(dto?.customerId.value).toBe(validData.customer_id);
      expect(dto?.customerAddressId.value).toBe(validData.customer_address_id);
      expect(dto?.assignedBy.value).toBe(validData.assigned_by);
      expect(dto?.notes).toBe(validData.notes);
    });

    it("Deberia crear un DTO valido sin notas", () => {
      const { notes, ...dataWithoutNotes } = validData;
      const [error, dto] =
        CreateEquipmentAssignmentDto.create(dataWithoutNotes);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.notes).toBeUndefined();
    });
  });
});
