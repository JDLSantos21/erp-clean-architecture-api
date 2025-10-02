import { Request, Response } from "express";
import {
  CreateMaintenanceProcedureDto,
  CreateMaintenanceProcedure,
  VehicleMaintenanceRepository,
  CustomError,
} from "../../../domain";
import {
  MaintenanceSetupService,
  MaintenanceSchedulerJob,
} from "../../../infrastructure";
import { PrismaClient } from "@prisma/client";
import { BaseController } from "../../shared/base.controller";

export class MaintenanceProcedureController extends BaseController {
  private maintenanceSchedulerJob: MaintenanceSchedulerJob;
  private maintenanceSetupService: MaintenanceSetupService;

  constructor(
    private readonly createMaintenanceProcedureUseCase: CreateMaintenanceProcedure,
    private readonly vehicleMaintenanceRepository: VehicleMaintenanceRepository,
    private readonly prisma: PrismaClient
  ) {
    super();
    this.maintenanceSchedulerJob = new MaintenanceSchedulerJob(prisma);
    this.maintenanceSetupService = new MaintenanceSetupService(prisma);
  }

  createMaintenanceProcedure = async (req: Request, res: Response) => {
    const [error, createMaintenanceProcedureDto] =
      CreateMaintenanceProcedureDto.create(req.body);

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
    }

    try {
      const procedure = await this.createMaintenanceProcedureUseCase.execute(
        createMaintenanceProcedureDto!
      );

      this.handleCreated(res, procedure, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaintenanceProcedures = async (req: Request, res: Response) => {
    try {
      const procedures =
        await this.vehicleMaintenanceRepository.getMaintenanceProcedures();

      this.handleSuccess(res, procedures, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateMaintenanceProcedure = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const procedureId = parseInt(id);

      if (isNaN(procedureId)) {
        const customError = CustomError.badRequest(
          "ID de procedimiento inválido"
        );
        return this.handleError(customError, res, req);
      }

      const [error, updateData] = CreateMaintenanceProcedureDto.create(
        req.body
      );

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const procedure =
        await this.vehicleMaintenanceRepository.updateMaintenanceProcedure(
          procedureId,
          updateData!
        );

      this.handleSuccess(res, procedure, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteMaintenanceProcedure = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const procedureId = parseInt(id);

      if (isNaN(procedureId)) {
        const customError = CustomError.badRequest(
          "ID de procedimiento inválido"
        );
        return this.handleError(customError, res, req);
      }

      await this.vehicleMaintenanceRepository.deleteMaintenanceProcedure(
        procedureId
      );

      this.handleSuccess(res, true, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos simples para alias (compatibilidad con rutas)
  create = this.createMaintenanceProcedure;
  getAll = this.getMaintenanceProcedures;
  update = this.updateMaintenanceProcedure;
  delete = this.deleteMaintenanceProcedure;

  // Métodos de mantenimientos
  createMaintenance = async (req: Request, res: Response) => {
    try {
      const { vehicle_id, scheduled_date, notes } = req.body;

      if (!vehicle_id || !scheduled_date) {
        const customError = CustomError.badRequest(
          "El ID del vehículo y la fecha programada son requeridos"
        );
        return this.handleError(customError, res, req);
      }

      const maintenance =
        await this.vehicleMaintenanceRepository.createMaintenance({
          vehicleId: vehicle_id,
          scheduledDate: new Date(scheduled_date),
          notes,
        });

      this.handleCreated(res, maintenance, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaintenances = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        vehicle_id,
        status,
        date_from,
        date_to,
        sort_by = "scheduledDate",
        sort_order = "desc",
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        vehicleId: vehicle_id as string,
        status: status as any,
        dateFrom: date_from ? new Date(date_from as string) : undefined,
        dateTo: date_to ? new Date(date_to as string) : undefined,
        sortBy: sort_by as string,
        sortOrder: sort_order as "asc" | "desc",
      };

      const result = await this.vehicleMaintenanceRepository.getMaintenances(
        filters
      );

      const pagination = {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
      };

      this.handleSuccessWithPagination(
        res,
        result.maintenances,
        pagination,
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaintenanceById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const maintenance =
        await this.vehicleMaintenanceRepository.getMaintenanceById(id);

      if (!maintenance) {
        throw CustomError.notFound("Mantenimiento no encontrado");
      }

      this.handleSuccess(res, maintenance, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateMaintenanceStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        const customError = CustomError.badRequest("El estado es requerido");
        return this.handleError(customError, res, req);
      }

      const validStatuses = [
        "PROGRAMADO",
        "EN_PROGRESO",
        "COMPLETADO",
        "CANCELADO",
        "VENCIDO",
        "PARCIAL",
      ];

      if (!validStatuses.includes(status)) {
        const customError = CustomError.badRequest("Estado inválido");
        return this.handleError(customError, res, req);
      }

      const maintenance =
        await this.vehicleMaintenanceRepository.updateMaintenanceStatus(
          id,
          status
        );

      this.handleSuccess(res, maintenance, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos de alertas
  generateAlerts = async (req: Request, res: Response) => {
    try {
      const alerts =
        await this.vehicleMaintenanceRepository.generateMaintenanceAlerts();

      this.handleSuccess(res, { alerts, count: alerts.length }, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAlerts = async (req: Request, res: Response) => {
    try {
      const { vehicle_id, priority } = req.query;

      const alerts =
        await this.vehicleMaintenanceRepository.getMaintenanceAlerts(
          vehicle_id as string,
          priority as any
        );

      this.handleSuccess(res, { alerts, count: alerts.length }, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  markAlertAsRead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const alert = await this.vehicleMaintenanceRepository.markAlertAsRead(id);

      this.handleSuccess(res, alert, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  dismissAlert = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.vehicleMaintenanceRepository.dismissAlert(id);

      this.handleSuccess(res, true, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos de reportes
  getIncompleteMaintenances = async (req: Request, res: Response) => {
    try {
      const maintenances =
        await this.vehicleMaintenanceRepository.getIncompleteMaintenanceReport();

      this.handleSuccess(
        res,
        { maintenances, count: maintenances.length },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getOverdueMaintenances = async (req: Request, res: Response) => {
    try {
      const maintenances =
        await this.vehicleMaintenanceRepository.getOverdueMaintenances();

      this.handleSuccess(
        res,
        { maintenances, count: maintenances.length },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getUpcomingMaintenances = async (req: Request, res: Response) => {
    try {
      const { days } = req.params;
      const daysNumber = parseInt(days);

      if (isNaN(daysNumber) || daysNumber < 1) {
        const customError = CustomError.badRequest("Número de días inválido");
        return this.handleError(customError, res, req);
      }

      const maintenances =
        await this.vehicleMaintenanceRepository.getUpcomingMaintenances(
          daysNumber
        );

      this.handleSuccess(
        res,
        { maintenances, count: maintenances.length },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos para jobs/automatización
  runMaintenanceScheduler = async (req: Request, res: Response) => {
    try {
      await this.maintenanceSchedulerJob.executeDaily();

      this.handleSuccess(
        res,
        { message: "Job de programación automática ejecutado exitosamente" },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  runAlertsGenerator = async (req: Request, res: Response) => {
    try {
      await this.maintenanceSchedulerJob.generateAutomaticAlerts();

      this.handleSuccess(
        res,
        { message: "Generación de alertas ejecutada exitosamente" },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  cleanOldAlerts = async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;
      const daysNumber = parseInt(days as string);

      if (isNaN(daysNumber) || daysNumber < 1) {
        const customError = CustomError.badRequest("Número de días inválido");
        return this.handleError(customError, res, req);
      }

      await this.maintenanceSchedulerJob.cleanOldAlerts(daysNumber);

      this.handleSuccess(
        res,
        {
          message: `Alertas antiguas de ${daysNumber} días eliminadas exitosamente`,
        },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos de configuración de schedules
  setupMaintenanceSchedules = async (req: Request, res: Response) => {
    try {
      await this.maintenanceSetupService.setupMaintenanceSchedulesForAllVehicles();

      this.handleSuccess(
        res,
        {
          message:
            "Schedules de mantenimiento configurados para todos los vehículos",
        },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  setupCustomSchedule = async (req: Request, res: Response) => {
    try {
      const { vehicleId } = req.params;
      const { intervalMonths, intervalKilometers } = req.body;

      if (!intervalMonths || intervalMonths < 1) {
        const customError = CustomError.badRequest(
          "El intervalo en meses es requerido y debe ser mayor a 0"
        );
        return this.handleError(customError, res, req);
      }

      await this.maintenanceSetupService.setupCustomScheduleForVehicle(
        vehicleId,
        intervalMonths,
        intervalKilometers
      );

      this.handleSuccess(
        res,
        {
          message: `Schedule personalizado configurado para vehículo ${vehicleId}`,
        },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getScheduleStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.maintenanceSetupService.getScheduleStats();

      this.handleSuccess(res, stats, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
