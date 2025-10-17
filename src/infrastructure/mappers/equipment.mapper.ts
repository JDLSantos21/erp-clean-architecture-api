import {
  Equipment,
  EquipmentAssignment,
  EquipmentModel,
  EquipmentLocation,
  EquipmentReport,
  IntegerId,
  UUID,
  EquipmentSerialNumber,
} from "../../domain";

export class EquipmentMapper {
  /**
   * Mapper básico de Equipment - SIN relaciones
   * Úsalo cuando solo necesites los datos del equipo
   */
  static EquipmentToDomain(data: any): Equipment {
    return new Equipment({
      id: UUID.create(data.id),
      serialNumber: EquipmentSerialNumber.create(data.serialNumber),
      modelId: IntegerId.create(data.modelId),
      locationId: data.locationId
        ? IntegerId.create(data.locationId)
        : undefined,
      status: data.status,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Mapper de Equipment CON relaciones opcionales
   * Úsalo cuando necesites incluir relaciones específicas
   *
   * @example
   * // Con modelo y ubicación
   * EquipmentMapper.EquipmentToDomainWithRelations(data, {
   *   includeModel: true,
   *   includeLocation: true
   * })
   */
  static EquipmentToDomainWithRelations(
    data: any,
    options: {
      includeModel?: boolean;
      includeLocation?: boolean;
      includeAssignments?: boolean;
      includeReports?: boolean;
    } = {}
  ): Equipment {
    const equipment = this.EquipmentToDomain(data);

    // Cargar relaciones solo si están presentes Y fueron solicitadas
    if (options.includeModel && data.model) {
      equipment.model = this.EquipmentModelToDomain(data.model);
    }

    if (options.includeLocation && data.location) {
      equipment.location = this.EquipmentLocationToDomain(data.location);
    }

    if (options.includeAssignments && data.assignments) {
      equipment.assignments = data.assignments.map((a: any) =>
        this.EquipmentAssignmentToDomain(a)
      );
    }

    if (options.includeReports && data.reports) {
      equipment.reports = data.reports.map((r: any) =>
        this.EquipmentReportToDomain(r)
      );
    }

    return equipment;
  }

  /**
   * Mapper básico de EquipmentModel - SIN relaciones
   */
  static EquipmentModelToDomain(data: any): EquipmentModel {
    return new EquipmentModel({
      id: IntegerId.create(data.id),
      name: data.name,
      brand: data.brand,
      type: data.type,
      capacity: data.capacity,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Mapper básico de EquipmentLocation - SIN relaciones
   */
  static EquipmentLocationToDomain(data: any): EquipmentLocation {
    return new EquipmentLocation({
      id: data.id,
      latitude: data.latitude,
      longitude: data.longitude,
      gpsPoint: data.gpsPoint,
      address: data.address,
      description: data.description,
      gpsUpdatedAt: data.gpsUpdatedAt,
      gpsUpdatedBy: data.gpsUpdatedBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Mapper básico de EquipmentAssignment - SIN relaciones
   * Este es el mapper que usarás el 90% del tiempo
   */
  static EquipmentAssignmentToDomain(data: any): EquipmentAssignment {
    return new EquipmentAssignment({
      id: IntegerId.create(data.id),
      equipmentId: UUID.create(data.equipmentId),
      customerId: UUID.create(data.customerId),
      customerAddressId: IntegerId.create(data.customerAddressId),
      assignedAt: data.assignedAt,
      unassignedAt: data.unassignedAt,
      deliveredAt: data.deliveredAt,
      status: data.status,
      assignedById: UUID.create(data.assignedBy),
      unassignedById: data.unassignedById
        ? UUID.create(data.unassignedById)
        : undefined,
      deliveredById: data.deliveredById
        ? UUID.create(data.deliveredById)
        : undefined,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Mapper de EquipmentAssignment CON relaciones opcionales
   * Úsalo cuando necesites incluir equipment, customer o address
   *
   * IMPORTANTE: Si incluyes equipment, NO incluyas assignments del equipment
   * para evitar dependencias circulares
   */
  static EquipmentAssignmentToDomainWithRelations(
    data: any,
    options: {
      includeEquipment?: boolean;
      includeCustomer?: boolean;
      includeCustomerAddress?: boolean;
      includeAssignedBy?: boolean;
      includeUnassignedBy?: boolean;
      includeDeliveredBy?: boolean;
    } = {}
  ): EquipmentAssignment {
    const assignment = this.EquipmentAssignmentToDomain(data);

    // Equipment SIN sus assignments para evitar ciclo infinito
    if (options.includeEquipment && data.equipment) {
      assignment.equipment = this.EquipmentToDomain(data.equipment);
    }

    // TODO: Agregar mappers de Customer cuando estén disponibles
    // if (options.includeCustomer && data.customer) {
    //   assignment.customer = CustomerMapper.toDomain(data.customer);
    // }

    // if (options.includeCustomerAddress && data.customerAddress) {
    //   assignment.customerAddress = CustomerMapper.addressToDomain(data.customerAddress);
    // }

    // TODO: Agregar mappers de User cuando estén disponibles
    // if (options.includeAssignedBy && data.assignedByUser) {
    //   assignment.assignedBy = UserMapper.toDomain(data.assignedByUser);
    // }

    return assignment;
  }

  /**
   * Mapper básico de EquipmentReport - SIN relaciones
   */
  static EquipmentReportToDomain(data: any): EquipmentReport {
    return new EquipmentReport({
      id: data.id,
      equipmentId: data.equipmentId,
      customerId: data.customerId,
      reportedById: data.reportedBy,
      title: data.title,
      description: data.description,
      type: data.reportType,
      priority: data.priority,
      status: data.status,
      scheduledDate: data.scheduledDate,
      completedAt: data.completedAt,
      notes: data.notes,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
