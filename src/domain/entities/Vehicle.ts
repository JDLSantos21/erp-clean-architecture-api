import Entity from "./entity";

export class Vehicle extends Entity<Vehicle> {
  id!: string;
  licensePlate!: string;
  chasis!: string;
  brand!: string;
  model!: string;
  year!: number;
  currentTag!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
