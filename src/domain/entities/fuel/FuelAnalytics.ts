import Entity from "../entity";
import { Period } from "../vehicle";

export class FuelMetrics extends Entity<FuelMetrics> {
  period!: Period;
  totalConsumption!: number;
  totalRefills!: number;
  totalCost!: number;
  averageEfficiency!: number;
  peakConsumptionHour!: number;
  mostEfficientVehicle!: string;
  leastEfficientVehicle!: string;
  alertsGenerated!: number;
  costSavings!: number;
}

export class DashboardSummary extends Entity<DashboardSummary> {
  currentTankLevel!: number;
  tankCapacity!: number;
  minLevel!: number;
  tankPercentage!: number;
  todayConsumption!: number;
  yesterdayConsumption!: number;
  weeklyConsumption!: number;
  monthlyConsumption!: number;
  averageFleetEfficiency!: number; // Ahora representa precio promedio por galón
  totalCostThisMonth!: number;
  totalCostLastMonth!: number;
}
