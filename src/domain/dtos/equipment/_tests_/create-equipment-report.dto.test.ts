import { CreateEquipmentReportDto } from "../create-equipment-report.dto";

describe("CreateEquipmentReportDto", () => {
  const validData = {
    equipment_id: "550e8400-e29b-41d4-a716-446655440000",
    customer_id: "550e8400-e29b-41d4-a716-446655440000",
    reported_by: "550e8400-e29b-41d4-a716-446655440000",
    title: "Report Title",
    description: "Report Description",
    report_type: "CORRECTIVO",
    priority: "ALTA",
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
  };

  describe("create", () => {
    it("Deberia crear un DTO valido", () => {
      const [error, dto] = CreateEquipmentReportDto.create(validData);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.equipmentId.value).toBe(validData.equipment_id);
    });

    it("Deberia fallar si faltan datos obligatorios", () => {
      const { equipment_id, ...incompleteData } = validData;
      const [error, dto] = CreateEquipmentReportDto.create(incompleteData);
      expect(error).toBe("Faltan datos obligatorios");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si el titulo no es valido", () => {
      const invalidData = { ...validData, title: 123 };
      const [error, dto] = CreateEquipmentReportDto.create(invalidData);
      expect(error).toBe("El título no es válido");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si el tipo de reporte no es valido", () => {
      const invalidData = { ...validData, report_type: "INVALIDO" };
      const [error, dto] = CreateEquipmentReportDto.create(invalidData);
      expect(error).toBe("El tipo de reporte no es válido");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si la prioridad no es valida", () => {
      const invalidData = { ...validData, priority: "INVALIDA" };
      const [error, dto] = CreateEquipmentReportDto.create(invalidData);
      expect(error).toBe("La prioridad no es válida");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si la fecha programada es en el pasado", () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const invalidData = { ...validData, scheduled_at: pastDate };
      const [error, dto] = CreateEquipmentReportDto.create(invalidData);
      expect(error).toBe("La fecha no puede estar en el pasado");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si los IDs no son UUID validos", () => {
      const invalidData = {
        ...validData,
        customer_id: "invalid-uuid",
      };
      const [error, dto] = CreateEquipmentReportDto.create(invalidData);
      expect(error).toBe("El formato del ID no es válido");
      expect(dto).toBeUndefined();
    });
  });
});
