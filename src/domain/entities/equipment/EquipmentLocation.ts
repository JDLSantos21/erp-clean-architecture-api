import Entity from "../entity";
import { User } from "../Users";

export class EquipmentLocation extends Entity<EquipmentLocation> {
  id!: number;
  latitude!: number;
  longitude!: number;
  address?: string;
  description?: string;
  gpsUpdatedAt!: Date;
  gpsUpdatedBy!: string;
  gpsUpdatedByUser?: User;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio
  public hasAddress(): boolean {
    return !!this.address && this.address.trim().length > 0;
  }

  public hasDescription(): boolean {
    return !!this.description && this.description.trim().length > 0;
  }

  public getCoordinates(): { latitude: number; longitude: number } {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  public getFormattedCoordinates(): string {
    return `${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}`;
  }

  public updateCoordinates(
    latitude: number,
    longitude: number,
    userId: string
  ): void {
    this.latitude = latitude;
    this.longitude = longitude;
    this.gpsUpdatedAt = new Date();
    this.gpsUpdatedBy = userId;
  }

  public calculateDistanceTo(otherLocation: EquipmentLocation): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(otherLocation.latitude - this.latitude);
    const dLon = this.toRadians(otherLocation.longitude - this.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.latitude)) *
        Math.cos(this.toRadians(otherLocation.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  public isWithinRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): boolean {
    const centerLocation = new EquipmentLocation();
    centerLocation.latitude = centerLat;
    centerLocation.longitude = centerLng;

    return this.calculateDistanceTo(centerLocation) <= radiusKm;
  }

  public getGoogleMapsUrl(): string {
    return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
  }

  public getLocationSummary(): string {
    let summary = this.getFormattedCoordinates();

    if (this.hasAddress()) {
      summary = `${this.address} (${summary})`;
    }

    if (this.hasDescription()) {
      summary += ` - ${this.description}`;
    }

    return summary;
  }

  public isRecentlyUpdated(hoursThreshold: number = 24): boolean {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hoursThreshold);

    return this.gpsUpdatedAt > hoursAgo;
  }

  public getHoursSinceUpdate(): number {
    const diffTime = new Date().getTime() - this.gpsUpdatedAt.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60));
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
