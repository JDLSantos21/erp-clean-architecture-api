import { Request, Response } from "express";
import {
  CreateMaintenanceProcedureDto,
  CreateMaintenanceProcedure,
  VehicleMaintenanceRepository,
  CustomError,
} from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { MaintenanceSchedulerJob } from "../../infrastructure/jobs/maintenance-scheduler.job";
import { MaintenanceSetupService } from "../../infrastructure/services/maintenance-setup.service";
import { PrismaClient } from "@prisma/client";

export class MaintenanceProcedureController {
  private maintenanceSchedulerJob: MaintenanceSchedulerJob;
  private maintenanceSetupService: MaintenanceSetupService;

  constructor(
    private readonly createMaintenanceProcedureUseCase: CreateMaintenanceProcedure,
    private readonly vehicleMaintenanceRepository: VehicleMaintenanceRepository,
    private readonly prisma: PrismaClient
  ) {
    this.maintenanceSchedulerJob = new MaintenanceSchedulerJob(prisma);
    this.maintenanceSetupService = new MaintenanceSetupService(prisma);
  }

  private handleError = (error: unknown, res: Response, req: Request) => {
    console.log("Maintenance Controller Error: ", error);
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Ocurrió un error inesperado", req));
  };

  createMaintenanceProcedure = async (req: Request, res: Response) => {
    const [error, createMaintenanceProcedureDto] =
      CreateMaintenanceProcedureDto.create(req.body);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const procedure = await this.createMaintenanceProcedureUseCase.execute(
        createMaintenanceProcedureDto!
      );

      res.status(201).json(ResponseBuilder.success(procedure, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaintenanceProcedures = async (req: Request, res: Response) => {
    try {
      const procedures =
        await this.vehicleMaintenanceRepository.getMaintenanceProcedures();

      res.json(ResponseBuilder.success(procedures, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateMaintenanceProcedure = async (req: Request, res: Response) => {
    const { id } = req.params;
    const procedureId = parseInt(id);

    if (isNaN(procedureId)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "ID de procedimiento inválido", req));
      return;
    }

    const [error, updateData] = CreateMaintenanceProcedureDto.create(req.body);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    try {
      const procedure =
        await this.vehicleMaintenanceRepository.updateMaintenanceProcedure(
          procedureId,
          updateData!
        );

      res.json(ResponseBuilder.success(procedure, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteMaintenanceProcedure = async (req: Request, res: Response) => {
    const { id } = req.params;
    const procedureId = parseInt(id);

    if (isNaN(procedureId)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "ID de procedimiento inválido", req));
      return;
    }

    try {
      await this.vehicleMaintenanceRepository.deleteMaintenanceProcedure(
        procedureId
      );

      res.json(ResponseBuilder.success(true, req));
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
    const { vehicle_id, scheduled_date, notes } = req.body;

    if (!vehicle_id || !scheduled_date) {
      res
        .status(400)
        .json(
          ResponseBuilder.error(
            400,
            "El ID del vehículo y la fecha programada son requeridos",
            req
          )
        );
      return;
    }

    try {
      const maintenance =
        await this.vehicleMaintenanceRepository.createMaintenance({
          vehicleId: vehicle_id,
          scheduledDate: new Date(scheduled_date),
          notes,
        });

      res.status(201).json(ResponseBuilder.success(maintenance, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaintenances = async (req: Request, res: Response) => {
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

    try {
      const result = await this.vehicleMaintenanceRepository.getMaintenances(
        filters
      );

      const pagination = {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
      };

      res.json(
        ResponseBuilder.successWithPagination(
          result.maintenances,
          pagination,
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getMaintenanceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const maintenance =
        await this.vehicleMaintenanceRepository.getMaintenanceById(id);

      if (!maintenance) {
        throw CustomError.notFound("Mantenimiento no encontrado");
      }

      res.json(ResponseBuilder.success(maintenance, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateMaintenanceStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "El estado es requerido", req));
      return;
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
      res.status(400).json(ResponseBuilder.error(400, "Estado inválido", req));
      return;
    }

    try {
      const maintenance =
        await this.vehicleMaintenanceRepository.updateMaintenanceStatus(
          id,
          status
        );

      res.json(ResponseBuilder.success(maintenance, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos de alertas
  generateAlerts = async (req: Request, res: Response) => {
    try {
      const alerts =
        await this.vehicleMaintenanceRepository.generateMaintenanceAlerts();

      res.json(ResponseBuilder.success({ alerts, count: alerts.length }, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAlerts = async (req: Request, res: Response) => {
    const { vehicle_id, priority } = req.query;

    try {
      const alerts =
        await this.vehicleMaintenanceRepository.getMaintenanceAlerts(
          vehicle_id as string,
          priority as any
        );

      res.json(ResponseBuilder.success({ alerts, count: alerts.length }, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  markAlertAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const alert = await this.vehicleMaintenanceRepository.markAlertAsRead(id);

      res.json(ResponseBuilder.success(alert, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  dismissAlert = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await this.vehicleMaintenanceRepository.dismissAlert(id);

      res.json(ResponseBuilder.success(true, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos de reportes
  getIncompleteMaintenances = async (req: Request, res: Response) => {
    try {
      const maintenances =
        await this.vehicleMaintenanceRepository.getIncompleteMaintenanceReport();

      res.json(
        ResponseBuilder.success(
          { maintenances, count: maintenances.length },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getOverdueMaintenances = async (req: Request, res: Response) => {
    try {
      const maintenances =
        await this.vehicleMaintenanceRepository.getOverdueMaintenances();

      res.json(
        ResponseBuilder.success(
          { maintenances, count: maintenances.length },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getUpcomingMaintenances = async (req: Request, res: Response) => {
    const { days } = req.params;
    const daysNumber = parseInt(days);

    if (isNaN(daysNumber) || daysNumber < 1) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "Número de días inválido", req));
      return;
    }

    try {
      const maintenances =
        await this.vehicleMaintenanceRepository.getUpcomingMaintenances(
          daysNumber
        );

      res.json(
        ResponseBuilder.success(
          { maintenances, count: maintenances.length },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos para jobs/automatización
  runMaintenanceScheduler = async (req: Request, res: Response) => {
    try {
      await this.maintenanceSchedulerJob.executeDaily();

      res.json(
        ResponseBuilder.success(
          { message: "Job de programación automática ejecutado exitosamente" },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  runAlertsGenerator = async (req: Request, res: Response) => {
    try {
      await this.maintenanceSchedulerJob.generateAutomaticAlerts();

      res.json(
        ResponseBuilder.success(
          { message: "Generación de alertas ejecutada exitosamente" },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  cleanOldAlerts = async (req: Request, res: Response) => {
    const { days = 30 } = req.query;
    const daysNumber = parseInt(days as string);

    if (isNaN(daysNumber) || daysNumber < 1) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "Número de días inválido", req));
      return;
    }

    try {
      await this.maintenanceSchedulerJob.cleanOldAlerts(daysNumber);

      res.json(
        ResponseBuilder.success(
          {
            message: `Alertas antiguas de ${daysNumber} días eliminadas exitosamente`,
          },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Métodos de configuración de schedules
  setupMaintenanceSchedules = async (req: Request, res: Response) => {
    try {
      await this.maintenanceSetupService.setupMaintenanceSchedulesForAllVehicles();

      res.json(
        ResponseBuilder.success(
          {
            message:
              "Schedules de mantenimiento configurados para todos los vehículos",
          },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  setupCustomSchedule = async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const { intervalMonths, intervalKilometers } = req.body;

    if (!intervalMonths || intervalMonths < 1) {
      res
        .status(400)
        .json(
          ResponseBuilder.error(
            400,
            "El intervalo en meses es requerido y debe ser mayor a 0",
            req
          )
        );
      return;
    }

    try {
      await this.maintenanceSetupService.setupCustomScheduleForVehicle(
        vehicleId,
        intervalMonths,
        intervalKilometers
      );

      res.json(
        ResponseBuilder.success(
          {
            message: `Schedule personalizado configurado para vehículo ${vehicleId}`,
          },
          req
        )
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getScheduleStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.maintenanceSetupService.getScheduleStats();

      res.json(ResponseBuilder.success(stats, req));
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
