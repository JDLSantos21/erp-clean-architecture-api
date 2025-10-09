// import {
//   ReportType,
//   ReportPriority,
//   ReportStatus,
//   EquipmentReport,
// } from "../entities";

// export interface CreateEquipmentReportDto {
//   equipmentId: string;
//   customerId: string;
//   reportedBy: string;
//   title: string;
//   description: string;
//   reportType: ReportType;
//   priority?: ReportPriority;
//   scheduledDate?: Date;
//   estimatedCost?: number;
//   attachments?: string[];
// }

// export interface UpdateEquipmentReportDto {
//   id: number;
//   title?: string;
//   description?: string;
//   reportType?: ReportType;
//   priority?: ReportPriority;
//   status?: ReportStatus;
//   scheduledDate?: Date;
//   startedAt?: Date;
//   completedAt?: Date;
//   estimatedCost?: number;
//   actualCost?: number;
//   notes?: string;
//   resolution?: string;
//   attachments?: string[];
// }

// export interface EquipmentReportFilters {
//   equipmentId?: string;
//   customerId?: string;
//   reportedBy?: string;
//   reportType?: ReportType;
//   priority?: ReportPriority;
//   status?: ReportStatus;
//   dateFrom?: Date;
//   dateTo?: Date;
//   isActive?: boolean;
// }

// export interface EquipmentReportSummary {
//   totalReports: number;
//   pendingReports: number;
//   inProgressReports: number;
//   completedReports: number;
//   criticalReports: number;
//   averageResolutionTime?: number; // en horas
//   totalEstimatedCost: number;
//   totalActualCost: number;
// }

// export abstract class EquipmentReportDatasource {
//   // CRUD Operations
//   abstract create(
//     createEquipmentReportDto: CreateEquipmentReportDto
//   ): Promise<EquipmentReport>;
//   abstract getById(id: number): Promise<EquipmentReport>;
//   abstract getAll(filters?: EquipmentReportFilters): Promise<EquipmentReport[]>;
//   abstract update(
//     updateEquipmentReportDto: UpdateEquipmentReportDto
//   ): Promise<EquipmentReport>;
//   abstract delete(id: number): Promise<EquipmentReport>;

//   // Business Operations
//   abstract startWork(reportId: number): Promise<EquipmentReport>;
//   abstract completeWork(
//     reportId: number,
//     resolution: string,
//     actualCost?: number
//   ): Promise<EquipmentReport>;
//   abstract cancelReport(
//     reportId: number,
//     reason?: string
//   ): Promise<EquipmentReport>;

//   // Query Operations
//   abstract getByEquipment(equipmentId: string): Promise<EquipmentReport[]>;
//   abstract getByCustomer(customerId: string): Promise<EquipmentReport[]>;
//   abstract getPendingReports(): Promise<EquipmentReport[]>;
//   abstract getCriticalReports(): Promise<EquipmentReport[]>;
//   abstract getOverdueReports(): Promise<EquipmentReport[]>;

//   // Analytics and Reporting
//   abstract getSummary(
//     filters?: EquipmentReportFilters
//   ): Promise<EquipmentReportSummary>;
//   abstract getMaintenanceHistory(
//     equipmentId: string
//   ): Promise<EquipmentReport[]>;

//   // File Management
//   abstract addAttachment(
//     reportId: number,
//     attachmentUrl: string
//   ): Promise<EquipmentReport>;
//   abstract removeAttachment(
//     reportId: number,
//     attachmentUrl: string
//   ): Promise<EquipmentReport>;
// }
