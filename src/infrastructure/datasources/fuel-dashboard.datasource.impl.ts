import { Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import { CustomError, FuelDashboardQueryDto } from "../../domain";
import {
  FuelDashboard,
  DashboardKPIs,
  ConsumptionTrendPoint,
  TopVehicleConsumption,
  TypeDistribution,
  EfficiencyAlert,
} from "../../domain/entities/fuel/FuelDashboard";
import { buildUtcDateRange } from "../../shared/utils/date-range.util";

const PLANT_TAG = "PLANTA";
const USER_TZ = "America/Santo_Domingo";

/**
 * Datasource dedicado a las consultas del Fuel Analytics Dashboard.
 * Orquesta 5 secciones: KPIs, tendencia, top vehículos, distribución y alertas.
 */
export class FuelDashboardDatasourceImpl {
  constructor(private readonly prisma: PrismaClient) {}

  // === MÉTODO PRINCIPAL ===

  async getDashboardData(
    params: FuelDashboardQueryDto,
  ): Promise<FuelDashboard> {
    try {
      const { start, end } = this.resolveDateRange(params);
      const { prevStart, prevEnd } = this.previousPeriod(start, end);
      const vFilter = params.vehicleId
        ? Prisma.sql`AND fc.vehicle_id = ${params.vehicleId}::uuid`
        : Prisma.sql``;

      // Ejecutar todas las consultas en paralelo
      const [summary, trend, topVehicles, distribution, alerts] =
        await Promise.all([
          this.buildSummary(start, end, prevStart, prevEnd, vFilter),
          this.buildTrend(start, end, vFilter),
          params.vehicleId
            ? Promise.resolve([])
            : this.buildTopVehicles(start, end),
          params.vehicleId
            ? Promise.resolve([])
            : this.buildTypeDistribution(start, end),
          this.buildAlerts(start, end, params.alertThreshold, params.vehicleId),
        ]);

      return new FuelDashboard({
        summary,
        consumptionTrend: trend,
        topVehicles,
        typeDistribution: distribution,
        efficiencyAlerts: alerts,
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error getting dashboard data", error);
    }
  }

  // === RESOLVERS DE FECHA ===

  private resolveDateRange(params: FuelDashboardQueryDto) {
    if (params.startDate && params.endDate) {
      const range = buildUtcDateRange(params.startDate, params.endDate, USER_TZ);
      return { start: range.gte!, end: range.lt! };
    }

    const now = DateTime.now().setZone(USER_TZ);
    return {
      start: now.minus({ days: 30 }).startOf("day").toUTC().toJSDate(),
      end: now.plus({ days: 1 }).startOf("day").toUTC().toJSDate(),
    };
  }

  private previousPeriod(start: Date, end: Date) {
    const diff = end.getTime() - start.getTime();
    return {
      prevStart: new Date(start.getTime() - diff),
      prevEnd: new Date(end.getTime() - diff),
    };
  }

  // === KPIs SUMMARY ===

  private async buildSummary(
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date,
    vFilter: Prisma.Sql,
  ): Promise<DashboardKPIs> {
    // Consulta de consumo + costo del período actual
    const [current] = await this.prisma.$queryRaw<any[]>`
      SELECT
        COALESCE(SUM(fc.gallons), 0) as total_gallons,
        COALESCE(SUM(fc.gallons * fr.price_per_gallon), 0) as total_cost,
        COALESCE(AVG(fr.price_per_gallon), 0) as avg_price
      FROM fuel_consumption fc
      LEFT JOIN fuel_refill fr ON fc.tank_refill_id = fr.id
      WHERE fc.consumed_at >= ${start} AND fc.consumed_at < ${end}
      ${vFilter}
    `;

    // Consulta del período anterior
    const [previous] = await this.prisma.$queryRaw<any[]>`
      SELECT
        COALESCE(SUM(fc.gallons), 0) as total_gallons,
        COALESCE(SUM(fc.gallons * fr.price_per_gallon), 0) as total_cost,
        COALESCE(AVG(fr.price_per_gallon), 0) as avg_price
      FROM fuel_consumption fc
      LEFT JOIN fuel_refill fr ON fc.tank_refill_id = fr.id
      WHERE fc.consumed_at >= ${prevStart} AND fc.consumed_at < ${prevEnd}
      ${vFilter}
    `;

    // Eficiencia de la flota (km/gal) — solo vehículos con mileage
    const [efficiency] = await this.prisma.$queryRaw<any[]>`
      WITH ordered AS (
        SELECT
          fc.mileage,
          fc.gallons,
          LAG(fc.mileage) OVER (
            PARTITION BY fc.vehicle_id ORDER BY fc.consumed_at ASC
          ) as prev_mileage
        FROM fuel_consumption fc
        JOIN vehicles v ON fc.vehicle_id = v.id
        WHERE fc.consumed_at >= ${start} AND fc.consumed_at < ${end}
          AND fc.mileage IS NOT NULL AND fc.mileage > 0
          AND v.current_tag != ${PLANT_TAG}
          ${vFilter}
      )
      SELECT
        COALESCE(SUM(CASE WHEN prev_mileage IS NOT NULL
          AND mileage - prev_mileage > 0
          THEN mileage - prev_mileage ELSE 0 END), 0) as total_km,
        COALESCE(SUM(CASE WHEN prev_mileage IS NOT NULL
          AND mileage - prev_mileage > 0
          THEN gallons ELSE 0 END), 0) as total_gallons
      FROM ordered
    `;

    // Eficiencia del período anterior
    const [prevEfficiency] = await this.prisma.$queryRaw<any[]>`
      WITH ordered AS (
        SELECT
          fc.mileage,
          fc.gallons,
          LAG(fc.mileage) OVER (
            PARTITION BY fc.vehicle_id ORDER BY fc.consumed_at ASC
          ) as prev_mileage
        FROM fuel_consumption fc
        JOIN vehicles v ON fc.vehicle_id = v.id
        WHERE fc.consumed_at >= ${prevStart} AND fc.consumed_at < ${prevEnd}
          AND fc.mileage IS NOT NULL AND fc.mileage > 0
          AND v.current_tag != ${PLANT_TAG}
          ${vFilter}
      )
      SELECT
        COALESCE(SUM(CASE WHEN prev_mileage IS NOT NULL
          AND mileage - prev_mileage > 0
          THEN mileage - prev_mileage ELSE 0 END), 0) as total_km,
        COALESCE(SUM(CASE WHEN prev_mileage IS NOT NULL
          AND mileage - prev_mileage > 0
          THEN gallons ELSE 0 END), 0) as total_gallons
      FROM ordered
    `;

    const totalConsumption = this.toNum(current.total_gallons);
    const prevConsumption = this.toNum(previous.total_gallons);
    const totalCost = this.toNum(current.total_cost);
    const prevCost = this.toNum(previous.total_cost);
    const avgPrice = this.toNum(current.avg_price);
    const prevPrice = this.toNum(previous.avg_price);

    const effKm = this.toNum(efficiency.total_km);
    const effGal = this.toNum(efficiency.total_gallons);
    const avgEfficiency = effGal > 0 ? effKm / effGal : 0;

    const prevEffKm = this.toNum(prevEfficiency.total_km);
    const prevEffGal = this.toNum(prevEfficiency.total_gallons);
    const prevAvgEfficiency = prevEffGal > 0 ? prevEffKm / prevEffGal : 0;

    return {
      totalConsumption: this.round(totalConsumption),
      consumptionChange: this.pctChange(totalConsumption, prevConsumption),
      totalCost: this.round(totalCost),
      costChange: this.pctChange(totalCost, prevCost),
      avgFleetEfficiency: this.round(avgEfficiency),
      efficiencyChange: this.pctChange(avgEfficiency, prevAvgEfficiency),
      avgPricePerGallon: this.round(avgPrice),
      priceChange: this.pctChange(avgPrice, prevPrice),
    };
  }

  // === CONSUMPTION TREND (gráfica) ===

  private async buildTrend(
    start: Date,
    end: Date,
    vFilter: Prisma.Sql,
  ): Promise<ConsumptionTrendPoint[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        DATE(fc.consumed_at AT TIME ZONE ${USER_TZ}) as date,
        SUM(fc.gallons) as fuel_usage,
        COALESCE(SUM(fc.gallons * fr.price_per_gallon), 0) as cost
      FROM fuel_consumption fc
      LEFT JOIN fuel_refill fr ON fc.tank_refill_id = fr.id
      WHERE fc.consumed_at >= ${start} AND fc.consumed_at < ${end}
      ${vFilter}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map((row) => {
      const dt = DateTime.fromJSDate(new Date(row.date), { zone: USER_TZ });
      return {
        date: dt.toISODate()!,
        label: dt.toFormat("dd/MM/yyyy"),
        fuelUsage: this.round(this.toNum(row.fuel_usage)),
        cost: this.round(this.toNum(row.cost)),
      };
    });
  }

  // === TOP 5 VEHÍCULOS ===

  private async buildTopVehicles(
    start: Date,
    end: Date,
  ): Promise<TopVehicleConsumption[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        v.id as vehicle_id,
        v.current_tag as name,
        v."licensePlate" as license_plate,
        SUM(fc.gallons) as total_gallons
      FROM fuel_consumption fc
      JOIN vehicles v ON fc.vehicle_id = v.id
      WHERE fc.consumed_at >= ${start} AND fc.consumed_at < ${end}
      GROUP BY v.id, v.current_tag, v."licensePlate"
      ORDER BY total_gallons DESC
      LIMIT 5
    `;

    return rows.map((row) => ({
      vehicleId: row.vehicle_id,
      name: row.name,
      licensePlate: row.license_plate,
      totalGallons: this.round(this.toNum(row.total_gallons)),
    }));
  }

  // === DISTRIBUCIÓN POR TIPO ===

  private async buildTypeDistribution(
    start: Date,
    end: Date,
  ): Promise<TypeDistribution[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        CASE WHEN v.current_tag = ${PLANT_TAG}
          THEN 'Planta Eléctrica' ELSE 'Vehículo' END as type,
        SUM(fc.gallons) as total_gallons
      FROM fuel_consumption fc
      JOIN vehicles v ON fc.vehicle_id = v.id
      WHERE fc.consumed_at >= ${start} AND fc.consumed_at < ${end}
      GROUP BY 1
    `;

    const total = rows.reduce((s, r) => s + this.toNum(r.total_gallons), 0);

    return rows.map((row) => ({
      type: row.type,
      totalGallons: this.round(this.toNum(row.total_gallons)),
      percentage: total > 0
        ? this.round((this.toNum(row.total_gallons) / total) * 100)
        : 0,
    }));
  }

  // === ALERTAS DE EFICIENCIA ===

  private async buildAlerts(
    start: Date,
    end: Date,
    threshold: number,
    vehicleId?: string,
  ): Promise<EfficiencyAlert[]> {
    // Consumo por vehículo en el período (excluye planta)
    const vehicleConsumptions = await this.prisma.$queryRaw<any[]>`
      SELECT
        v.id as vehicle_id,
        v.current_tag as name,
        v."licensePlate" as license_plate,
        SUM(fc.gallons) as total_gallons
      FROM fuel_consumption fc
      JOIN vehicles v ON fc.vehicle_id = v.id
      WHERE fc.consumed_at >= ${start} AND fc.consumed_at < ${end}
        AND v.current_tag != ${PLANT_TAG}
      GROUP BY v.id, v.current_tag, v."licensePlate"
    `;

    if (vehicleConsumptions.length === 0) return [];

    // Calcular media y desviación estándar
    const values = vehicleConsumptions.map((v) => this.toNum(v.total_gallons));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);
    const alertThreshold = mean + threshold * stdDev;

    const alerts: EfficiencyAlert[] = [];

    // HIGH_CONSUMPTION: consumo por encima del umbral estadístico
    for (const v of vehicleConsumptions) {
      const gallons = this.toNum(v.total_gallons);
      if (gallons <= alertThreshold) continue;

      // Filtrar por vehículo si se especificó
      if (vehicleId && v.vehicle_id !== vehicleId) continue;

      const pctAbove = this.round(((gallons - mean) / mean) * 100);
      alerts.push({
        vehicleId: v.vehicle_id,
        vehicleName: v.name,
        licensePlate: v.license_plate,
        alertType: "HIGH_CONSUMPTION",
        message: `Consumo ${pctAbove}% por encima del promedio de la flota`,
        severity: gallons > mean + 2 * stdDev ? "CRITICAL" : "WARNING",
        currentValue: this.round(gallons),
        referenceValue: this.round(mean),
      });
    }

    // CONSUMPTION_SPIKE: comparar con período anterior
    const { prevStart, prevEnd } = this.previousPeriod(start, end);
    const prevConsumptions = await this.prisma.$queryRaw<any[]>`
      SELECT
        v.id as vehicle_id,
        v.current_tag as name,
        v."licensePlate" as license_plate,
        SUM(fc.gallons) as total_gallons
      FROM fuel_consumption fc
      JOIN vehicles v ON fc.vehicle_id = v.id
      WHERE fc.consumed_at >= ${prevStart} AND fc.consumed_at < ${prevEnd}
        AND v.current_tag != ${PLANT_TAG}
      GROUP BY v.id, v.current_tag, v."licensePlate"
    `;

    const prevMap = new Map(
      prevConsumptions.map((v) => [v.vehicle_id, this.toNum(v.total_gallons)]),
    );

    for (const v of vehicleConsumptions) {
      if (vehicleId && v.vehicle_id !== vehicleId) continue;

      const currentGal = this.toNum(v.total_gallons);
      const prevGal = prevMap.get(v.vehicle_id);
      if (!prevGal || prevGal === 0) continue;

      const increase = ((currentGal - prevGal) / prevGal) * 100;
      // Spike significativo: > 50% de incremento
      if (increase <= 50) continue;

      // Evitar duplicados si ya tiene alerta HIGH_CONSUMPTION
      const alreadyAlerted = alerts.some(
        (a) =>
          a.vehicleId === v.vehicle_id && a.alertType === "HIGH_CONSUMPTION",
      );
      if (alreadyAlerted) continue;

      alerts.push({
        vehicleId: v.vehicle_id,
        vehicleName: v.name,
        licensePlate: v.license_plate,
        alertType: "CONSUMPTION_SPIKE",
        message: `Incremento de ${this.round(increase)}% vs período anterior`,
        severity: increase > 100 ? "CRITICAL" : "WARNING",
        currentValue: this.round(currentGal),
        referenceValue: this.round(prevGal),
      });
    }

    return alerts;
  }

  // === UTILIDADES ===

  private toNum(val: any): number {
    return parseFloat(val?.toString() || "0") || 0;
  }

  private round(val: number, decimals = 2): number {
    return Math.round(val * 10 ** decimals) / 10 ** decimals;
  }

  private pctChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return this.round(((current - previous) / previous) * 100);
  }
}
