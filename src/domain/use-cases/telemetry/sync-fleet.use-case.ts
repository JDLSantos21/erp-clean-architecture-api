import { TelemetryDatasource } from "../../datasources/telemetry.datasource";
import { TelemetryRepository } from "../../repositories/telemetry.repository";

export class SyncFleetUseCase {
  constructor(
    private readonly datasource: TelemetryDatasource,
    private readonly repository: TelemetryRepository
  ) {}

  async execute(): Promise<void> {
    const vehicles = await this.datasource.getFleetTelemetry();
    await this.repository.updateFleet(vehicles);
  }
}
