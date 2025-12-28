import { VehicleTelemetry } from "../entities/telemetry/VehicleTelemetry";

export abstract class TelemetryRepository {
  abstract updateFleet(vehicles: VehicleTelemetry[]): Promise<void>;
  abstract getAllVehicles(): Promise<VehicleTelemetry[]>;
  abstract getVehicleById(id: number): Promise<VehicleTelemetry | null>;
}
