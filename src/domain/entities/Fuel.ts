import { Employee } from "./Employee";
import Entity from "./entity";
import { User } from "./Users";
import { Vehicle } from "./Vehicle";

export class FuelTank extends Entity<FuelTank> {
  id!: number;
  capacity!: number;
  currentLevel!: number;
  minLevel!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class FuelConsumption extends Entity<FuelConsumption> {
  id!: number;
  vehicleId!: string;
  vehicle!: Vehicle;
  driverId?: string | null;
  gallons!: number;
  mileage?: number | null;
  tankRefillId?: number | null;
  notes?: string | null;
  userId!: string;
  driver?: Employee;
  user!: User;
  consumedAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

export class FuelRefill extends Entity<FuelRefill> {
  id!: number;
  gallons!: number;
  pricePerGallon?: number;
  previousLevel!: number;
  newLevel!: number;
  userId!: string;
  user!: User;
  createdAt!: Date;
  updatedAt!: Date;
  consumptions?: FuelConsumption[];
}

export class FuelTankReset extends Entity<FuelTankReset> {
  id!: number;
  previousLevel!: number;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
