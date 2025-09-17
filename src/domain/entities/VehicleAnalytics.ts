import Entity from "./entity";

export type Period = "daily" | "weekly" | "monthly" | "yearly";

export class VehicleMetrics extends Entity<VehicleMetrics> {
  vehicleId!: string;
  licensePlate!: string;
  period!: string;
  totalFuelConsumed!: number;
  totalMileage!: number;
  fuelEfficiency!: number; // km/gallons
  averageConsumptionPerTrip!: number;
  totalTrips!: number;
  costPerKm!: number;
  totalCost!: number;
  comparisonToPreviousPeriod!: number; // percentage
}
