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
    () => new GpsGateDatasourceImpl(container.resolve("CacheService"))
  );

  // Repository
  container.registerSingleton(
    "TelemetryRepository",
    () =>
      new TelemetryRepositoryImpl(
        container.resolve("TelemetryDatasource"),
        container.resolve("CacheService")
      )
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
