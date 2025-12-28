import { IDIContainer } from "../types";
import { GpsGateDatasourceImpl } from "../../datasources/gps-gate.datasource.impl";
import { TelemetryRepositoryImpl } from "../../repositories/telemetry.repository.impl";
import {
  SyncFleetUseCase,
  GetNearbyVehiclesUseCase,
} from "../../../domain/use-cases/telemetry";

export function registerTelemetryModule(container: IDIContainer): void {
  // Datasource
  container.registerSingleton(
    "TelemetryDatasource",
    () => new GpsGateDatasourceImpl()
  );

  // Repository
  container.registerSingleton(
    "TelemetryRepository",
    () => new TelemetryRepositoryImpl()
  );

  // Use Cases
  container.register("SyncFleetUseCase", () => {
    const datasource = container.resolve<GpsGateDatasourceImpl>(
      "TelemetryDatasource"
    );
    const repository = container.resolve<TelemetryRepositoryImpl>(
      "TelemetryRepository"
    );
    return new SyncFleetUseCase(datasource, repository);
  });

  container.register("GetNearbyVehiclesUseCase", () => {
    const repository = container.resolve<TelemetryRepositoryImpl>(
      "TelemetryRepository"
    );
    return new GetNearbyVehiclesUseCase(repository);
  });
}
