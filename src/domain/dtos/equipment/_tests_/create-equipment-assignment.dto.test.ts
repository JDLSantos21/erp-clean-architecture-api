import { CreateEquipmentAssignmentDto } from "../create-equipment-assignment.dto";

describe("CreateEquipmentAssigmentDto", () => {
  const validData = {
    equipment_id: 1,
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
      expect(dto?.equipmentId.value).toBe(validData.equipment_id);
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

    it("Deberia fallar si faltan datos obligatorios", () => {
      const { equipment_id, ...incompleteData } = validData;
      const [error, dto] = CreateEquipmentAssignmentDto.create(incompleteData);
      expect(error).toBe("Faltan datos obligatorios");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si las notas no son validas", () => {
      const invalidData = { ...validData, notes: 12 };
      const [error, dto] = CreateEquipmentAssignmentDto.create(invalidData);
      expect(error).toBe("Formato de las notas inválidas");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si los IDs no son validos", () => {
      const invalidData = { ...validData, equipment_id: -1 };
      const [error, dto] = CreateEquipmentAssignmentDto.create(invalidData);
      expect(error).toBe("El ID debe ser un entero positivo");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si el UUID no es valido", () => {
      const invalidData = { ...validData, assigned_by: "invalid-uuid" };
      const [error, dto] = CreateEquipmentAssignmentDto.create(invalidData);
      expect(error).toBe("El formato del ID no es válido");
      expect(dto).toBeUndefined();
    });
  });
});
