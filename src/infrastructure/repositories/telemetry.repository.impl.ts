import { TelemetryRepository } from "../../domain/repositories/telemetry.repository";
import { VehicleTelemetry } from "../../domain/entities/telemetry/VehicleTelemetry";

export class TelemetryRepositoryImpl implements TelemetryRepository {
  // In-memory storage
  private vehicleMap: Map<number, VehicleTelemetry> = new Map();

  async updateFleet(vehicles: VehicleTelemetry[]): Promise<void> {
    vehicles.forEach((vehicle) => {
      this.vehicleMap.set(vehicle.id, vehicle);
    });
  }

  async getAllVehicles(): Promise<VehicleTelemetry[]> {
    return Array.from(this.vehicleMap.values());
  }

  async getVehicleById(id: number): Promise<VehicleTelemetry | null> {
    return this.vehicleMap.get(id) || null;
  }
}
