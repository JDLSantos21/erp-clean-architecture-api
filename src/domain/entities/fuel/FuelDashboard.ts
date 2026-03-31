import Entity from "../entity";

export interface DashboardKPIs {
  totalConsumption: number;
  consumptionChange: number; // % vs período anterior
  totalCost: number;
  costChange: number;
  avgFleetEfficiency: number; // km/gal
  efficiencyChange: number;
  avgPricePerGallon: number;
  priceChange: number;
}

export interface ConsumptionTrendPoint {
  date: string;
  label: string;
  fuelUsage: number;
  cost: number;
}

export interface TopVehicleConsumption {
  vehicleId: string;
  name: string;
  licensePlate: string;
  totalGallons: number;
}

export interface TypeDistribution {
  type: string;
  totalGallons: number;
  percentage: number;
}

// === Alertas de eficiencia ===

export type AlertSeverity = "WARNING" | "CRITICAL";
export type EfficiencyAlertType = "HIGH_CONSUMPTION" | "CONSUMPTION_SPIKE";

export interface EfficiencyAlert {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  alertType: EfficiencyAlertType;
  message: string;
  severity: AlertSeverity;
  currentValue: number;
  referenceValue: number; // Promedio de flota o valor previo
}

export class FuelDashboard extends Entity<FuelDashboard> {
  summary!: DashboardKPIs;
  consumptionTrend!: ConsumptionTrendPoint[];
  topVehicles!: TopVehicleConsumption[];
  typeDistribution!: TypeDistribution[];
  efficiencyAlerts!: EfficiencyAlert[];
}
