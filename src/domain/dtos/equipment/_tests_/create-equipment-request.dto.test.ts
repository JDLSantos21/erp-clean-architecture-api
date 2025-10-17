import { CreateEquipmentRequestDto } from "../create-equipment-request.dto";

const requiredValidData = {
  equipment_type: "NEVERA",
  description: "A valid description",
  contact_name: "John Doe",
  contact_phone: "8091234567",
  requested_by: "550e8400-e29b-41d4-a716-446655440000",
};

describe("CreateEquipmentRequestDto", () => {
  describe("create", () => {
    it("Deberia crear un DTO valido con solo datos obligatorios", () => {
      const [error, dto] = CreateEquipmentRequestDto.create(requiredValidData);
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.equipmentType).toBe("NEVERA");
    });
  });
  it("Deberia crear un DTO valido con todos los datos", () => {
    const fullValidData = {
      ...requiredValidData,
      contact_email: "john.doe@example.com",
      company_name: "ACME Corp",
      business_type: "Retail",
      address: "123 Main St",
      notes: "Some notes",
    };
    const [error, dto] = CreateEquipmentRequestDto.create(fullValidData);
    expect(error).toBeUndefined();
    expect(dto).toBeDefined();
    expect(dto?.contactEmail).toBe("john.doe@example.com");
    expect(dto?.companyName).toBe("ACME Corp");
    expect(dto?.businessType).toBe("Retail");
    expect(dto?.address).toBe("123 Main St");
    expect(dto?.notes).toBe("Some notes");
  });

  it("Deberia fallar si faltan datos obligatorios", () => {
    const { equipment_type, ...incompleteData } = requiredValidData;
    const [error, dto] = CreateEquipmentRequestDto.create(incompleteData);
    expect(error).toBe("Faltan campos obligatorios");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el tipo de equipo no es valido", () => {
    const invalidData = { ...requiredValidData, equipment_type: "INVALIDO" };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("Tipo de equipo inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el formato de la descripcion es invalido", () => {
    const invalidData = { ...requiredValidData, description: 123 };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El formato de la descripción es inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el formato del nombre de contacto es invalido", () => {
    const invalidData = { ...requiredValidData, contact_name: 456 };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El formato del nombre de contacto es inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el correo electronico de contacto es invalido", () => {
    const invalidData = {
      ...requiredValidData,
      contact_email: "invalid-email",
    };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El correo electrónico de contacto es inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el formato de la direccion es invalido", () => {
    const invalidData = { ...requiredValidData, address: 789 };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El formato de la dirección es inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el formato del nombre de la empresa es invalido", () => {
    const invalidData = { ...requiredValidData, company_name: 101112 };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El formato del nombre de la empresa es inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el formato del tipo de negocio es invalido", () => {
    const invalidData = { ...requiredValidData, business_type: 131415 };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El formato del tipo de negocio es inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si el formato de las notas es invalido", () => {
    const invalidData = { ...requiredValidData, notes: 161718 };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El formato de las notas es inválido");
    expect(dto).toBeUndefined();
  });

  it("Deberia fallar si los IDs no son UUID validos", () => {
    const invalidData = {
      ...requiredValidData,
      requested_by: "invalid-uuid",
    };
    const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
    expect(error).toBe("El formato del ID no es válido");
    expect(dto).toBeUndefined();
  });

  describe("Validaciones", () => {
    it("Deberia fallar si el telefono no es valido", () => {
      const invalidData = {
        ...requiredValidData,
        contact_phone: "invalid-phone",
      };
      const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
      expect(error).toBe("El formato del número de teléfono no es válido");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si el customer_id no es un UUID valido", () => {
      const invalidData = {
        ...requiredValidData,
        customer_id: "invalid-uuid",
      };
      const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
      expect(error).toBe("El formato del ID no es válido");
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si el customer_address_id no es un IntegerId valido", () => {
      const invalidData = {
        ...requiredValidData,
        customer_address_id: -5,
      };
      const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("Deberia fallar si el equipment_model_id no es un IntegerId valido", () => {
      const invalidData = {
        ...requiredValidData,
        equipment_model_id: 0,
      };
      const [error, dto] = CreateEquipmentRequestDto.create(invalidData);
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });
  });
});
