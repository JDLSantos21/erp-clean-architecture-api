import {
  FuelMetrics,
  DashboardSummary,
  FuelMetricsDto,
  VehicleMetricsDto,
  VehicleMetrics,
  CustomError,
} from "../../domain";
import { DateTime } from "luxon";
import { buildUtcDateRange } from "../../shared/utils/date-range.util";
import { PrismaClient } from "@prisma/client";

export class FuelAnalyticsDatasourceImpl {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly userTz = "America/Santo_Domingo";
  private readonly DB_QUERYS = {
    monthlyCost: async (monthlyRange: {
      gte: Date;
      lte: Date;
    }): Promise<any[]> =>
      await this.prisma.$queryRaw`
        SELECT
          COALESCE(SUM(fc.gallons * fr.price_per_gallon), 0) as total_cost,
          COALESCE(AVG(fr.price_per_gallon), 0) as avg_price_per_gallon
        FROM fuel_consumption fc
        LEFT JOIN fuel_refill fr ON fc.tank_refill_id = fr.id
        WHERE fc.consumed_at >= ${monthlyRange.gte}
          AND fc.consumed_at <= ${monthlyRange.lte}
          AND fr.price_per_gallon IS NOT NULL
      `,
    lastMonthCost: async (lastMonthRange: {
      gte: Date;
      lte: Date;
    }): Promise<any[]> =>
      await this.prisma.$queryRaw`
        SELECT COALESCE(SUM(fc.gallons * fr.price_per_gallon), 0) as total_cost
        FROM fuel_consumption fc
        LEFT JOIN fuel_refill fr ON fc.tank_refill_id = fr.id
        WHERE fc.consumed_at >= ${lastMonthRange.gte}
          AND fc.consumed_at <= ${lastMonthRange.lte}
          AND fr.price_per_gallon IS NOT NULL
      `,
    mileage: async ({ vehicleId, startDate, endDate }: any): Promise<any[]> =>
      await this.prisma.$queryRaw`
        WITH ordered_consumptions AS (
          SELECT 
            fc.mileage,
            ROW_NUMBER() OVER (ORDER BY fc.consumed_at ASC) as row_num
          FROM fuel_consumption fc
          WHERE fc.vehicle_id = ${vehicleId}::uuid
            AND fc.consumed_at >= ${startDate}
            AND fc.consumed_at <= ${endDate}
            AND fc.mileage IS NOT NULL
            AND fc.mileage > 0
        ),
        mileage_differences AS (
          SELECT 
            curr.mileage - prev.mileage as mileage_diff
          FROM ordered_consumptions curr
          JOIN ordered_consumptions prev ON curr.row_num = prev.row_num + 1
        )
        SELECT COALESCE(SUM(mileage_diff), 0) as total_mileage
        FROM mileage_differences
        WHERE mileage_diff > 0
      `,
    costs: async ({ vehicleId, startDate, endDate }: any): Promise<any[]> =>
      (await this.prisma.$queryRaw`
        SELECT 
          COALESCE(SUM(fc.gallons * fr.price_per_gallon), 0) as total_cost,
          COALESCE(AVG(fr.price_per_gallon), 0) as avg_price_per_gallon
        FROM fuel_consumption fc
        LEFT JOIN fuel_refill fr ON fc.tank_refill_id = fr.id
        WHERE fc.vehicle_id = ${vehicleId}::uuid
          AND fc.consumed_at >= ${startDate}
          AND fc.consumed_at <= ${endDate}
          AND fr.price_per_gallon IS NOT NULL
      `) as any[],
  };

  /**
   * Crea un rango de fechas UTC desde la zona horaria local para un día específico
   */
  private createUtcDayRange(date: Date): { gte: Date; lt: Date } {
    const dateTime = DateTime.fromJSDate(date, { zone: this.userTz });
    const startOfDay = dateTime.startOf("day").toUTC();
    const endOfDay = dateTime.plus({ days: 1 }).startOf("day").toUTC();

    return {
      gte: startOfDay.toJSDate(),
      lt: endOfDay.toJSDate(),
    };
  }

  /**
   * Crea un rango de fechas UTC desde la zona horaria local
   */
  private createUtcDateRange(
    startDate: Date,
    endDate: Date
  ): { gte: Date; lte: Date } {
    const start = DateTime.fromJSDate(startDate, { zone: this.userTz })
      .startOf("day")
      .toUTC();
    const end = DateTime.fromJSDate(endDate, { zone: this.userTz })
      .endOf("day")
      .toUTC();

    return {
      gte: start.toJSDate(),
      lte: end.toJSDate(),
    };
  }

  /**
   * Calcula las fechas de inicio y fin basadas en el período especificado usando zona horaria local
   */
  private calculatePeriodDates(
    period: string,
    startDate?: string,
    endDate?: string
  ): { startDate: Date; endDate: Date } {
    if (startDate && endDate) {
      // Usar buildUtcDateRange para convertir las fechas ISO string a UTC correctamente
      const utcRange = buildUtcDateRange(startDate, endDate, this.userTz);
      return {
        startDate: utcRange.gte!,
        endDate: utcRange.lt!, // lt es exclusive, así que convertimos a lte
      };
    }

    const nowLocal = DateTime.now().setZone(this.userTz);
    let start: DateTime;
    let end: DateTime;

    switch (period) {
      case "daily":
        start = nowLocal.startOf("day");
        end = nowLocal.endOf("day");
        break;

      case "weekly":
        start = nowLocal.minus({ days: 7 }).startOf("day");
        end = nowLocal.endOf("day");
        break;

      case "monthly":
        start = nowLocal.startOf("month");
        end = nowLocal.endOf("month");
        break;

      case "yearly":
        start = nowLocal.startOf("year");
        end = nowLocal.endOf("year");
        break;

      default:
        // Default to monthly
        start = nowLocal.startOf("month");
        end = nowLocal.endOf("month");
        break;
    }

    // Convertir a UTC para las consultas de base de datos
    return {
      startDate: start.toUTC().toJSDate(),
      endDate: end.toUTC().toJSDate(),
    };
  }

  /**
   * Calcula las fechas del período anterior para comparación usando zona horaria local
   */
  private calculatePreviousPeriodDates(
    startDate: Date,
    endDate: Date
  ): { startDatePrevious: Date; endDatePrevious: Date } {
    // Convertir las fechas UTC de vuelta a la zona horaria local para calcular correctamente
    const startLocal = DateTime.fromJSDate(startDate, { zone: "UTC" }).setZone(
      this.userTz
    );
    const endLocal = DateTime.fromJSDate(endDate, { zone: "UTC" }).setZone(
      this.userTz
    );

    const periodLength = endLocal.diff(startLocal);

    const startPreviousLocal = startLocal.minus(periodLength);
    const endPreviousLocal = endLocal.minus(periodLength);

    return {
      startDatePrevious: startPreviousLocal.toUTC().toJSDate(),
      endDatePrevious: endPreviousLocal.toUTC().toJSDate(),
    };
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // Obtener estado actual del tanque
      const tankStatus = await this.prisma.fuelTank.findUnique({
        where: { id: 1 },
      });

      // Obtener fechas en zona horaria local
      const nowLocal = DateTime.now().setZone(this.userTz);
      const today = nowLocal.toJSDate();
      const yesterday = nowLocal.minus({ days: 1 }).toJSDate();

      // Crear rangos UTC para las consultas
      const todayRange = this.createUtcDayRange(today);
      const yesterdayRange = this.createUtcDayRange(yesterday);

      const todayConsumption = await this.prisma.fuelConsumption.aggregate({
        where: {
          consumedAt: todayRange,
        },
        _sum: { gallons: true },
      });

      const yesterdayConsumption = await this.prisma.fuelConsumption.aggregate({
        where: {
          consumedAt: yesterdayRange,
        },
        _sum: { gallons: true },
      });

      // Consumo semanal (últimos 7 días)
      const weekAgoLocal = nowLocal.minus({ days: 7 }).toJSDate();
      const weeklyRange = this.createUtcDateRange(weekAgoLocal, today);

      const weeklyConsumption = await this.prisma.fuelConsumption.aggregate({
        where: {
          consumedAt: weeklyRange,
        },
        _sum: { gallons: true },
      });

      // Consumo mensual (últimos 30 días)
      const monthAgoLocal = nowLocal.minus({ days: 30 }).toJSDate();
      const monthlyRange = this.createUtcDateRange(monthAgoLocal, today);

      const { _sum: monthlySum } = await this.prisma.fuelConsumption.aggregate({
        where: {
          consumedAt: monthlyRange,
        },
        _sum: { gallons: true },
      });

      // Costo total del mes basado en CONSUMO REAL
      const monthlyCostQuery = await this.DB_QUERYS.monthlyCost(monthlyRange);

      const monthlyCost = parseFloat(monthlyCostQuery[0]?.total_cost || "0");
      const avgPricePerGallon = parseFloat(
        monthlyCostQuery[0]?.avg_price_per_gallon || "0"
      );

      // Costo del mes pasado basado en CONSUMO REAL
      const twoMonthsAgoLocal = nowLocal.minus({ days: 60 }).toJSDate();
      const lastMonthRange = this.createUtcDateRange(
        twoMonthsAgoLocal,
        monthAgoLocal
      );

      const lastMonthCostQuery = await this.DB_QUERYS.lastMonthCost(
        lastMonthRange
      );

      const lastMonthCost = parseFloat(
        lastMonthCostQuery[0]?.total_cost || "0"
      );

      const summary = new DashboardSummary({
        currentTankLevel: tankStatus?.currentLevel || 0,
        tankCapacity: tankStatus?.capacity || 0,
        tankPercentage: tankStatus
          ? (tankStatus.currentLevel / tankStatus.capacity) * 100
          : 0,
        todayConsumption: todayConsumption._sum.gallons || 0,
        yesterdayConsumption: yesterdayConsumption._sum.gallons || 0,
        weeklyConsumption: weeklyConsumption._sum.gallons || 0,
        monthlyConsumption: monthlySum.gallons || 0,
        averageFleetEfficiency: avgPricePerGallon, // Cambiar a precio promedio por galón
        totalCostThisMonth: monthlyCost,
        totalCostLastMonth: lastMonthCost,
      });

      return summary;
    } catch (error) {
      throw CustomError.internalServer(
        "Error getting dashboard summary",
        error
      );
    }
  }

  async getVehicleMetrics(params: VehicleMetricsDto): Promise<VehicleMetrics> {
    const { vehicleId } = params;

    try {
      // Verificar que el vehículo existe
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        throw CustomError.notFound("El vehículo no fue encontrado");
      }

      // Calcular fechas del período
      const { startDate, endDate } = this.calculatePeriodDates(
        params.period,
        params.startDate,
        params.endDate
      );
      const { startDatePrevious, endDatePrevious } =
        this.calculatePreviousPeriodDates(startDate, endDate);

      // Obtener datos de consumo del período actual
      const currentPeriodData = await this.prisma.fuelConsumption.aggregate({
        where: {
          vehicleId: params.vehicleId,
          consumedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          gallons: true,
        },
        _count: {
          id: true,
        },
      });

      // Calcular el mileage real (diferencia entre lecturas del medidor)
      const mileageQuery = await this.DB_QUERYS.mileage({
        vehicleId,
        startDate,
        endDate,
      });

      const totalMileage = parseFloat(mileageQuery[0]?.total_mileage || "0");

      // Obtener datos del período anterior para comparación
      const previousPeriodData = await this.prisma.fuelConsumption.aggregate({
        where: {
          vehicleId,
          consumedAt: {
            gte: startDatePrevious,
            lte: endDatePrevious,
          },
        },
        _sum: {
          gallons: true,
        },
      });

      // Calcular costo total basado en el combustible consumido por este vehículo
      const costsQuery = await this.DB_QUERYS.costs({
        vehicleId,
        startDate,
        endDate,
      });

      const totalCost = parseFloat(costsQuery[0]?.total_cost || "0");

      const avgPricePerGallon = parseFloat(
        costsQuery[0]?.avg_price_per_gallon || "0"
      );

      // Calcular métricas
      const totalFuelConsumed = currentPeriodData._sum.gallons || 0;
      const totalTrips = currentPeriodData._count.id || 0;
      const fuelEfficiency =
        totalFuelConsumed > 0 ? totalMileage / totalFuelConsumed : 0;
      const averageConsumptionPerTrip =
        totalTrips > 0 ? totalFuelConsumed / totalTrips : 0;
      const costPerKm = totalMileage > 0 ? totalCost / totalMileage : 0;

      // Calcular comparación con período anterior
      const previousConsumption = previousPeriodData._sum.gallons || 0;
      const comparisonToPreviousPeriod =
        previousConsumption > 0
          ? ((totalFuelConsumed - previousConsumption) / previousConsumption) *
            100
          : 0;

      return new VehicleMetrics({
        vehicleId: params.vehicleId,
        licensePlate: vehicle.licensePlate,
        period: `${params.period} (${
          startDate.toISOString().split("T")[0]
        } to ${endDate.toISOString().split("T")[0]})`,
        totalFuelConsumed: Math.round(totalFuelConsumed * 100) / 100,
        totalMileage: Math.round(totalMileage * 100) / 100,
        fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
        averageConsumptionPerTrip:
          Math.round(averageConsumptionPerTrip * 100) / 100,
        totalTrips,
        costPerKm: Math.round(costPerKm * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        comparisonToPreviousPeriod:
          Math.round(comparisonToPreviousPeriod * 100) / 100,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer("Error getting vehicle metrics", error);
    }
  }

  async getDashboardMetrics(params: FuelMetricsDto): Promise<FuelMetrics> {
    try {
      // TODO: Implementar métricas del dashboard por período
      return new FuelMetrics({
        period: params.period,
        totalConsumption: 0,
        totalRefills: 0,
        totalCost: 0,
        averageEfficiency: 0,
        peakConsumptionHour: 0,
        mostEfficientVehicle: "",
        leastEfficientVehicle: "",
        alertsGenerated: 0,
        costSavings: 0,
      });
    } catch (error) {
      throw CustomError.internalServer(
        "Error getting dashboard metrics",
        error
      );
    }
  }
}
