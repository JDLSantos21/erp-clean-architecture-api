import Entity from "../entity";

export class VehicleTelemetry extends Entity<VehicleTelemetry> {
  id!: number;
  name!: string;
  lat!: number;
  lng!: number;
  speed!: number;
  heading!: number; // Rumbo
  lastUpdate!: Date;

  constructor(props: Partial<VehicleTelemetry>) {
    super();
    Object.assign(this, props);
  }
}
