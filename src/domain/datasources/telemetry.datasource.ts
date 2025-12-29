import { VehicleTelemetry } from "../entities/telemetry/VehicleTelemetry";

export abstract class TelemetryDatasource {
  abstract getFleetTelemetry(): Promise<VehicleTelemetry[]>;
}
