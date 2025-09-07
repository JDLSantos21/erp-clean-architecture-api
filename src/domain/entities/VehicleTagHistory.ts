import Entity from "./entity";

export class VehicleTagHistory extends Entity<VehicleTagHistory> {
  id!: number;
  vehicleId!: string;
  tag!: string;
  createdAt!: Date;
}
