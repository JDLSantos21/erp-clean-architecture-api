import { PrismaClient } from "@prisma/client";
import {
  CacheService,
  CreateEquipmentAssignmentDto,
  CreateEquipmentDto,
  CreateEquipmentModelDto,
  CreateEquipmentReportDto,
  CreateEquipmentRequestDto,
  CustomError,
  Equipment,
  EquipmentAssignment,
  EquipmentDatasource,
  EquipmentModel,
  EquipmentQueryDto,
  EquipmentReport,
  EquipmentSerialNumber,
  EquipmentStatus,
  FilterParams,
  IntegerId,
  Logger,
  UnassignEquipmentDto,
  UpdateEquipmentModelDto,
  UUID,
} from "../../domain";
import { CacheInvalidator, CacheKeyBuilder, CacheTTL } from "../utils";
import { buildWhere, EquipmentMapper } from "../mappers";

export class EquipmentDatasourceImpl extends EquipmentDatasource {
  private readonly cacheInvalidator: CacheInvalidator;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly cacheService: CacheService
  ) {
    super();
    this.cacheInvalidator = new CacheInvalidator(cacheService);
  }

  async createEquipment(
    data: CreateEquipmentDto & { serialNumber: EquipmentSerialNumber }
  ): Promise<Equipment> {
    const { modelId, status, serialNumber } = data;
    try {
      const createdEquipment = await this.prisma.equipment.create({
        data: {
          modelId: modelId.value,
          serialNumber: serialNumber.value,
          status,
        },
        include: {
          model: true,
        },
      });

      await this.cacheInvalidator.invalidateLists("equipment");

      return new Equipment(
        EquipmentMapper.EquipmentToDomainWithRelations(createdEquipment, {
          includeModel: true,
        })
      );
    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }

  async delete(id: UUID): Promise<void> {
    try {
      await this.prisma.equipment.delete({
        where: { id: id.value },
      });
    } catch (error) {
      Logger.error("Error deleting equipment", error);
      throw CustomError.internalServer(
        "Ocurrió un error al eliminar el equipo"
      );
    }
  }

  async createRequest(data: CreateEquipmentRequestDto): Promise<void> {
    const {
      equipmentModelId,
      customerId,
      requestedBy,
      customerAddressId,
      contactPhone,
      ...rest
    } = data;

    try {
      await this.prisma.equipmentRequest.create({
        data: {
          equipmentModelId: equipmentModelId?.value,
          customerId: customerId?.value,
          requestedBy: requestedBy?.value,
          customerAddressId: customerAddressId?.value,
          contactPhone: contactPhone?.value,
          ...rest,
        },
      });
    } catch (error) {
      Logger.error("Error creating equipment request", error);
      throw CustomError.internalServer(
        "Ocurrió un error al crear la solicitud de equipo"
      );
    }
  }

  async createReport(data: CreateEquipmentReportDto): Promise<EquipmentReport> {
    return this.prisma.$transaction(async (tx) => {
      const createdReport = await tx.equipmentReport.create({
        data: {
          equipmentId: data.equipmentId.value,
          reportedBy: data.reportedBy.value,
          customerId: data.customerId.value,
          description: data.description,
          reportType: data.reportType!,
          title: data.title,
          priority: data.priority,
          scheduledDate: data.scheduledAt?.toDate(),
        },
      });

      return new EquipmentReport({
        id: IntegerId.create(createdReport.id),
        equipmentId: data.equipmentId,
        customerId: data.customerId,
        reportedById: data.reportedBy,
        title: createdReport.title,
        description: createdReport.description,
        type: createdReport.reportType,
        priority: createdReport.priority,
        scheduledDate: createdReport.scheduledDate || undefined,
        status: createdReport.status,
        isActive: createdReport.isActive,
        createdAt: createdReport.createdAt,
        updatedAt: createdReport.updatedAt,
      });
    });
  }

  async deleteRequest(id: IntegerId): Promise<void> {
    try {
      await this.prisma.equipmentRequest.delete({
        where: { id: id.value },
      });
    } catch (error) {
      Logger.error("Error deleting equipment request", error);
      throw CustomError.internalServer(
        "Ocurrió un error al eliminar la solicitud de equipo"
      );
    }
  }

  async update(id: UUID, data: unknown): Promise<Equipment> {
    throw new Error("Method not implemented.");
  }

  async createAssignment(
    data: CreateEquipmentAssignmentDto,
    currentStatus: EquipmentStatus
  ): Promise<void> {
    const { equipmentId, assignedBy, customerAddressId, customerId, notes } =
      data;

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.equipmentAssignment.create({
          data: {
            equipmentId: equipmentId.value,
            customerId: customerId.value,
            customerAddressId: customerAddressId.value,
            assignedBy: assignedBy.value,
            notes,
          },
        });

        if (currentStatus === "DISPONIBLE") {
          await tx.equipment.update({
            where: { id: equipmentId.value },
            data: { status: "ASIGNADO" },
          });
        }
      });

      await Promise.all([
        this.cacheInvalidator.invalidateEntity("customer", customerId.value),
        this.cacheInvalidator.invalidateEntity("equipment", equipmentId.value),
        this.cacheInvalidator.invalidateLists("equipment"),
        this.cacheInvalidator.invalidateLists("customer"),
        this.cacheInvalidator.invalidateLists("equipmentAssignment"),
      ]);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      Logger.error("Error creating equipment assignment", error);
      throw CustomError.internalServer(
        "Ocurrió un error al crear la asignación"
      );
    }
  }

  async unassignEquipment(data: UnassignEquipmentDto): Promise<void> {
    const { assignmentId, unassignedBy, reason, notes } = data;

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Obtener la asignación actual para obtener el equipmentId
        const assignment = await tx.equipmentAssignment.findUnique({
          where: { id: assignmentId.value },
          select: { equipmentId: true },
        });

        if (!assignment) {
          throw CustomError.notFound("Asignación no encontrada");
        }

        // 2. Actualizar la asignación
        await tx.equipmentAssignment.update({
          where: { id: assignmentId.value },
          data: {
            status: reason,
            unassignedAt: new Date(),
            unassignedBy: unassignedBy.value,
            notes: notes
              ? `${notes}\n[Desasignado: ${new Date().toISOString()}]`
              : `[Desasignado: ${new Date().toISOString()}]`,
          },
        });

        // 3. Actualizar estado del equipo según la razón
        const equipmentStatus = this.getEquipmentStatusFromReason(reason);
        await tx.equipment.update({
          where: { id: assignment.equipmentId },
          data: { status: equipmentStatus },
        });
      });

      // 4. Invalidar cachés
      await Promise.all([
        this.cacheInvalidator.invalidateLists("equipment"),
        this.cacheInvalidator.invalidateLists("equipmentAssignment"),
      ]);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      Logger.error("Error unassigning equipment", error);
      throw CustomError.internalServer(
        "Ocurrió un error al desasignar el equipo"
      );
    }
  }

  async findAssignment(id: IntegerId): Promise<EquipmentAssignment> {
    try {
      const assignment = await this.prisma.equipmentAssignment.findUnique({
        where: { id: id.value },
        include: {
          equipment: { include: { model: true } },
          customer: true,
          customerAddress: true,
        },
      });

      if (!assignment) {
        throw CustomError.notFound("Asignación no encontrada");
      }

      return EquipmentMapper.EquipmentAssignmentToDomainWithRelations(
        assignment,
        {
          includeEquipment: true,
          includeCustomer: true,
          includeCustomerAddress: true,
        }
      );
    } catch (error) {
      if (error instanceof CustomError) throw error;
      Logger.error("Error fetching equipment assignment", error);
      throw CustomError.internalServer(
        "Ocurrió un error al obtener la asignación"
      );
    }
  }

  private getEquipmentStatusFromReason(
    reason: "REMOVIDO" | "DEVUELTO" | "DAÑADO" | "MANTENIMIENTO"
  ): EquipmentStatus {
    const statusMap: Record<typeof reason, EquipmentStatus> = {
      REMOVIDO: "DISPONIBLE",
      DEVUELTO: "DISPONIBLE",
      DAÑADO: "DAÑADO",
      MANTENIMIENTO: "MANTENIMIENTO",
    };

    return statusMap[reason];
  }
  async findOne(id: UUID): Promise<Equipment> {
    try {
      const cacheKey = CacheKeyBuilder.entity("equipment", id.value);
      const cached = await this.cacheService.get<Equipment>(cacheKey);
      if (cached)
        return new Equipment(
          EquipmentMapper.EquipmentToDomainWithRelations(cached, {
            includeModel: true,
            includeReports: true,
            includeLocation: true,
            includeAssignments: true,
          })
        );

      const equipment = await this.prisma.equipment.findUnique({
        where: { id: id.value },
        include: {
          model: true,
          assignments: true,
          reports: true,
          location: true,
        },
      });

      if (!equipment) throw CustomError.notFound("Equipo no encontrado");

      await this.cacheService.set(cacheKey, equipment, CacheTTL.STATIC);

      return new Equipment(
        EquipmentMapper.EquipmentToDomainWithRelations(equipment, {
          includeModel: true,
          includeReports: true,
          includeLocation: true,
          includeAssignments: true,
        })
      );
    } catch (error) {
      Logger.error("Error fetching equipment", error);
      throw CustomError.internalServer("Ocurrió un error al obtener el equipo");
    }
  }

  async updateStatus(id: UUID, status: EquipmentStatus): Promise<void> {
    try {
      await this.prisma.equipment.update({
        where: { id: id.value },
        data: { status },
      });
    } catch (error) {
      Logger.error("Error updating equipment status", error);
      throw CustomError.internalServer(
        "Ocurrió un error al actualizar el estado del equipo"
      );
    }
  }

  async findAll(
    filterParams: FilterParams<EquipmentQueryDto>
  ): Promise<{ equipments: Equipment[]; total: number }> {
    const { filters, limit, skip } = filterParams;

    const dateRangeField = "createdAt";

    const searchTermFields = ["serialNumber", "model.name"];

    const where = buildWhere(filters, searchTermFields, dateRangeField, {
      enumFields: ["status"],
      relationFilters: [
        {
          dtoField: "customerName",
          prismaRelation: "assignments",
          nestedPath: "customer.businessName",
          operator: "some",
          comparison: "contains",
        },
        {
          dtoField: "customerId",
          prismaRelation: "assignments",
          nestedPath: "customer.id",
          operator: "some",
          comparison: "equals",
        },
      ],
    });

    console.log("Equipment where:", JSON.stringify(where, null, 2));

    try {
      const cacheKey = CacheKeyBuilder.list<EquipmentQueryDto>(
        "equipment",
        filterParams
      );

      const cached = await this.cacheService.get<{
        equipments: Equipment[];
        total: number;
      }>(cacheKey);

      if (cached) {
        return {
          equipments: cached.equipments.map((item) =>
            EquipmentMapper.EquipmentToDomainWithRelations(item, {
              includeModel: true,
            })
          ),
          total: cached.total,
        };
      }

      const [equipments, total] = await Promise.all([
        await this.prisma.equipment.findMany({
          where,
          take: limit,
          skip,
          include: { model: true },
        }),
        await this.prisma.equipment.count({ where }),
      ]);

      await this.cacheService.set(
        cacheKey,
        { equipments, total },
        CacheTTL.STATIC
      );

      return {
        equipments: equipments.map((item) =>
          EquipmentMapper.EquipmentToDomainWithRelations(item, {
            includeModel: true,
          })
        ),
        total,
      };
    } catch (error) {
      Logger.error("Error fetching all equipment", error);
      throw CustomError.internalServer("Ocurrió un error al obtener el equipo");
    }
  }

  async createEquipmentModel(
    data: CreateEquipmentModelDto
  ): Promise<EquipmentModel> {
    try {
      const createdModel = await this.prisma.equipmentModel.create({
        data,
      });

      const cacheKey = CacheKeyBuilder.entity(
        "equipmentModel",
        createdModel.id
      );
      await this.cacheService.set(cacheKey, createdModel, CacheTTL.STATIC);
      return new EquipmentModel({
        ...createdModel,
        id: IntegerId.create(createdModel.id),
      });
    } catch (error) {
      Logger.error("Error creating equipment model", error);
      throw CustomError.internalServer(
        "Ocurrió un error al crear el modelo de equipo"
      );
    }
  }

  async updateModel(
    id: IntegerId,
    data: UpdateEquipmentModelDto
  ): Promise<EquipmentModel> {
    try {
      const updatedModel = await this.prisma.equipmentModel.update({
        where: { id: id.value },
        data,
      });

      const { id: _, ...rest } = updatedModel;

      this.cacheInvalidator.invalidateLists("equipmentModel");
      this.cacheInvalidator.invalidateEntity("equipmentModel", id.value);

      return new EquipmentModel({ id, ...rest });
    } catch (error) {
      Logger.error("Error updating equipment model", error);
      throw CustomError.internalServer(
        "Ocurrió un error al actualizar el modelo de equipo"
      );
    }
  }

  async findOneModel(id: IntegerId): Promise<EquipmentModel> {
    try {
      const cacheKey = CacheKeyBuilder.entity("equipmentModel", id.value);
      const cached = await this.cacheService.get<EquipmentModel>(cacheKey);
      if (cached) return new EquipmentModel({ ...cached, id });

      const model = await this.prisma.equipmentModel.findUnique({
        where: { id: id.value },
      });

      if (!model) throw CustomError.notFound("Modelo de equipo no encontrado");

      await this.cacheService.set(cacheKey, model, CacheTTL.STATIC);
      return new EquipmentModel({ ...model, id });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      Logger.error("Error fetching equipment model", error);
      throw CustomError.internalServer(
        "Ocurrió un error al obtener el modelo de equipo"
      );
    }
  }

  async deleteModel(id: IntegerId): Promise<void> {
    try {
      await this.prisma.equipmentModel.delete({
        where: { id: id.value },
      });
      this.cacheInvalidator.invalidateLists("equipmentModel");
      this.cacheInvalidator.invalidateEntity("equipmentModel", id.value);
    } catch (error) {
      Logger.error("Error deleting equipment model", error);
      throw CustomError.internalServer(
        "Ocurrió un error al eliminar el modelo de equipo"
      );
    }
  }

  async findAllByCustomerId(customerId: UUID): Promise<Equipment[]> {
    try {
      const cacheKey = CacheKeyBuilder.query("equipment", customerId.value);
      const cached = await this.cacheService.get<Equipment[]>(cacheKey);
      if (cached)
        return cached.map((item) =>
          EquipmentMapper.EquipmentToDomainWithRelations(item, {
            includeModel: true,
            includeAssignments: true,
          })
        );

      const equipments = await this.prisma.equipment.findMany({
        where: { assignments: { some: { customerId: customerId.value } } },
        include: {
          model: true,
          assignments: {
            take: 1,
            where: {
              customerId: customerId.value,
              AND: { unassignedAt: null },
            },
          },
        },
      });
      await this.cacheService.set(cacheKey, equipments, CacheTTL.STATIC);

      return equipments.map((equipment) =>
        EquipmentMapper.EquipmentToDomainWithRelations(equipment, {
          includeModel: true,
          includeAssignments: true,
        })
      );
    } catch (error) {
      Logger.error("Error fetching all equipments by customer ID", error);
      throw CustomError.internalServer(
        "Ocurrió un error al obtener todos los equipos por ID de cliente"
      );
    }
  }

  async findAllModels(): Promise<EquipmentModel[]> {
    try {
      const cacheKey = CacheKeyBuilder.list("equipmentModel");
      const cached = await this.cacheService.get<any[]>(cacheKey);
      console.log("Cached models:", cached);

      if (cached)
        return cached.map(
          (item) =>
            new EquipmentModel({ ...item, id: IntegerId.create(item.id) })
        );

      const models = await this.prisma.equipmentModel.findMany();
      await this.cacheService.set(cacheKey, models, CacheTTL.STATIC);

      return models.map(
        (item) => new EquipmentModel({ ...item, id: IntegerId.create(item.id) })
      );
    } catch (error) {
      Logger.error("Error fetching all equipment models", error);
      throw CustomError.internalServer(
        "Ocurrió un error al obtener todos los modelos de equipo"
      );
    }
  }
}
