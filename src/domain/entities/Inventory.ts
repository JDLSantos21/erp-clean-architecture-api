import Entity from "./entity";
import { User } from "./Users";

export class MaterialCategory extends Entity<MaterialCategory> {
  id!: number;
  name!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Unit extends Entity<Unit> {
  id!: number;
  name!: string;
  symbol?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Material extends Entity<Material> {
  id!: number;
  name!: string;
  description?: string;
  categoryId!: number;
  unitId!: number;
  stock!: number;
  minimumStock!: number;
  stockMoves?: StockMove[];
  createdAt?: Date;
  updatedAt?: Date;
  category?: MaterialCategory;
  unit?: Unit;

  get isLowStock(): boolean {
    return this.stock <= this.minimumStock;
  }

  get stockPercentage(): number {
    if (this.minimumStock === 0) return 100;
    return Math.min((this.stock / this.minimumStock) * 100, 100);
  }
}

export type StockMoveType = "ENTRADA" | "SALIDA" | "AJUSTE";

export class StockMove extends Entity<StockMove> {
  id!: number;
  materialId!: number;
  type!: StockMoveType;
  quantity!: number;
  userId!: string;
  description?: string;
  date!: Date;
  previousStock!: number;
  newStock!: number;
  createdAt?: Date;
  updatedAt?: Date;
  material?: Material;
  user?: User;

  get isInbound(): boolean {
    return (
      this.type === "ENTRADA" || (this.type === "AJUSTE" && this.quantity > 0)
    );
  }

  get isOutbound(): boolean {
    return (
      this.type === "SALIDA" || (this.type === "AJUSTE" && this.quantity < 0)
    );
  }

  get formattedType(): string {
    const types = {
      ENTRADA: "Entrada",
      SALIDA: "Salida",
      AJUSTE: "Ajuste",
    };
    return types[this.type];
  }
}
