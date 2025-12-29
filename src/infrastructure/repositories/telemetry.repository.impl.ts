import { TelemetryRepository } from "../../domain/repositories/telemetry.repository";
import { VehicleTelemetry } from "../../domain/entities/telemetry/VehicleTelemetry";
import { CacheService } from "../../domain/services/cache.service";
import { TelemetryDatasource } from "../../domain/datasources/telemetry.datasource";

export class TelemetryRepositoryImpl implements TelemetryRepository {
  private readonly CACHE_KEY = "FLEET_LAST_KNOWN_STATE";

  constructor(
    private readonly datasource: TelemetryDatasource,
    private readonly cacheService: CacheService
  ) {}

  async updateFleet(vehicles: VehicleTelemetry[]): Promise<void> {
    await this.cacheService.set(this.CACHE_KEY, vehicles);
  }

  async getAllVehicles(): Promise<VehicleTelemetry[]> {
    // 1. Intentar obtener del caché
    const cachedData = await this.cacheService.get<any[]>(this.CACHE_KEY);

    if (cachedData) {
      return cachedData.map(
        (v) =>
          new VehicleTelemetry({
            ...v,
            lastUpdate: new Date(v.lastUpdate),
          })
      );
    }

    // 2. Si no hay caché, obtener del datasource (GpsGate)
    const freshData = await this.datasource.getFleetTelemetry();

    // 3. Guardar en caché para futuras peticiones
    if (freshData.length > 0) {
      await this.updateFleet(freshData);
    }

    return freshData;
  }

  async getVehicleById(id: number): Promise<VehicleTelemetry | null> {
    const vehicles = await this.getAllVehicles();
    return vehicles.find((v) => v.id === id) || null;
  }
}
