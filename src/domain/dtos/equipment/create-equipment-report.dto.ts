import { Validators } from "../../../config";
import { REPORT_PRIORITY, REPORT_TYPE } from "../../constants";
import { ReportPriority, ReportType } from "../../entities";
import { FutureDate, UUID } from "../../value-object";

export class CreateEquipmentReportDto {
  private constructor(
    public equipmentId: UUID,
    public customerId: UUID,
    public reportedBy: UUID,
    public title: string,
    public description: string,
    public reportType?: ReportType,
    public priority?: ReportPriority,
    public scheduledAt?: FutureDate
  ) {}

  public static create(object: {
    [key: string]: any;
  }): [error?: string, CreateEquipmentReportDto?] {
    const {
      equipment_id,
      customer_id,
      reported_by,
      title,
      description,
      report_type,
      priority,
      scheduled_at,
    } = object;

    if (
      !equipment_id ||
      !reported_by ||
      !customer_id ||
      !title ||
      !description
    ) {
      return ["Faltan datos obligatorios"];
    }

    if (!Validators.isValidString(title)) return ["El título no es válido"];

    if (!Validators.isValidString(description))
      return ["La descripción no es válida"];

    const reportType = report_type
      ? REPORT_TYPE[report_type as ReportType]
      : undefined;

    if (report_type && !reportType) return ["El tipo de reporte no es válido"];

    const priorityLevel = priority
      ? REPORT_PRIORITY[priority as ReportPriority]
      : undefined;

    if (priority && !priorityLevel) return ["La prioridad no es válida"];

    try {
      const scheduledDate = FutureDate.create(scheduled_at);
      const customerId = UUID.create(customer_id);
      const equipmentId = UUID.create(equipment_id);
      const reportedBy = UUID.create(reported_by);

      return [
        undefined,
        new CreateEquipmentReportDto(
          equipmentId,
          customerId,
          reportedBy,
          title.trim(),
          description.trim(),
          reportType,
          priorityLevel,
          scheduledDate
        ),
      ];
    } catch (error: any) {
      return [error.message];
    }
  }
}
