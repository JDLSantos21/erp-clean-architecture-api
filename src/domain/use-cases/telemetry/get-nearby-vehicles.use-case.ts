import { TelemetryRepository } from "../../repositories/telemetry.repository";
import { VehicleTelemetry } from "../../entities/telemetry/VehicleTelemetry";
import { GetNearbyVehiclesDto } from "../../dtos/telemetry/get-nearby-vehicles.dto";
import axios from "axios";

interface VehicleWithEta extends VehicleTelemetry {
  distanceKm: number;
  durationMinutes: number;
}

export class GetNearbyVehiclesUseCase {
  constructor(private readonly repository: TelemetryRepository) {}

  async execute(dto: GetNearbyVehiclesDto): Promise<VehicleWithEta[]> {
    const allVehicles = await this.repository.getAllVehicles();

    console.log(
      `[USE CASE] Retrieved ${allVehicles.length} vehicles from repository.`
    );

    console.log(allVehicles[1]);

    // 1. Filter by Haversine (Radial)
    const nearbyVehicles = allVehicles.slice(0, 3).filter((vehicle) => {
      const distance = this.haversineDistance(
        dto.lat,
        dto.lng,
        vehicle.lat,
        vehicle.lng
      );
      console.log(distance);
      return distance <= dto.radiusKm;
    });

    // 2. Calculate real distance and ETA using OSRM
    const results: VehicleWithEta[] = [];

    for (const vehicle of nearbyVehicles) {
      try {
        const osrmData = await this.getOsrmRoute(
          { lat: vehicle.lat, lng: vehicle.lng },
          { lat: dto.lat, lng: dto.lng }
        );

        // Create a new object with the additional properties
        const vehicleWithEta = new VehicleTelemetry(vehicle) as VehicleWithEta;
        vehicleWithEta.distanceKm = osrmData.distance / 1000; // meters to km
        vehicleWithEta.durationMinutes = osrmData.duration / 60; // seconds to minutes

        results.push(vehicleWithEta);
      } catch (error) {
        console.error(`Error fetching OSRM for vehicle ${vehicle.id}`, error);
        // Optionally handle error, e.g., skip or use straight line distance
      }
    }

    return results.sort((a, b) => a.durationMinutes - b.durationMinutes);
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async getOsrmRoute(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) {
    // OSRM public API: http://router.project-osrm.org/route/v1/driving/{lon},{lat};{lon},{lat}?overview=false
    const url = `http://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=false`;

    const response = await axios.get(url);
    const routes = response.data.routes;

    if (routes && routes.length > 0) {
      return {
        distance: routes[0].distance, // meters
        duration: routes[0].duration, // seconds
      };
    }

    throw new Error("No route found");
  }
}
