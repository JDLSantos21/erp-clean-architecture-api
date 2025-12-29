import { TelemetryRepository } from "../../repositories/telemetry.repository";
import { VehicleTelemetry } from "../../entities/telemetry/VehicleTelemetry";
import { GetNearbyVehiclesDto } from "../../dtos/telemetry/get-nearby-vehicles.dto";
import axios from "axios";

interface VehicleWithEta extends VehicleTelemetry {
  distanceKm: number;
  durationMinutes: number;
}

export class GetNearbyVehiclesUseCase {
  private readonly OSRM_BASE_URL =
    "http://router.project-osrm.org/table/v1/driving";

  constructor(private readonly repository: TelemetryRepository) {}

  async execute(dto: GetNearbyVehiclesDto): Promise<VehicleWithEta[]> {
    const allVehicles = await this.repository.getAllVehicles();

    // 1. Filtrado radial inicial (Haversine) para reducir el set de datos
    const nearbyVehicles = allVehicles.filter((vehicle) => {
      const distance = this.haversineDistance(
        dto.lat,
        dto.lng,
        vehicle.lat,
        vehicle.lng
      );
      return distance <= dto.radiusKm;
    });

    if (nearbyVehicles.length === 0) return [];

    try {
      // 2. Cálculo masivo de Distancia y ETA mediante OSRM Table API
      const osrmData = await this.getOsrmMatrix(dto, nearbyVehicles);

      const results: VehicleWithEta[] = nearbyVehicles.map((vehicle, index) => {
        const vehicleWithEta = new VehicleTelemetry(vehicle) as VehicleWithEta;
        // OSRM Table retorna null si no hay ruta posible
        vehicleWithEta.distanceKm = (osrmData.distances[0][index] || 0) / 1000;
        vehicleWithEta.durationMinutes =
          (osrmData.durations[0][index] || 0) / 60;
        return vehicleWithEta;
      });

      return results.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } catch (error) {
      console.error("[USE CASE] Error calculating OSRM Matrix", error);
      throw new Error("Failed to calculate real-road distances");
    }
  }

  private async getOsrmMatrix(
    origin: { lat: number; lng: number },
    vehicles: VehicleTelemetry[]
  ) {
    // Estructura: origen;destino1;destino2;destino3...
    const coordinates = [
      `${origin.lng},${origin.lat}`,
      ...vehicles.map((v) => `${v.lng},${v.lat}`),
    ].join(";");

    // sources=0 fija el origen en la primera coordenada proporcionada
    // destinations=1;2;3... define los vehículos como puntos de llegada
    const destIndices = vehicles.map((_, i) => i + 1).join(";");

    const url = `${this.OSRM_BASE_URL}/${coordinates}?sources=0&destinations=${destIndices}&annotations=duration,distance`;

    const response = await axios.get(url);

    if (!response.data || !response.data.durations) {
      throw new Error("Invalid OSRM response");
    }

    return {
      durations: response.data.durations, // Matriz [1][n] en segundos
      distances: response.data.distances, // Matriz [1][n] en metros
    };
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
