import { Customer, Order } from "../../../domain";

export class CustomerResponseDto {
  id!: string;
  businessName!: string;
  representativeName!: string;
  rnc?: string | null;
  email?: string | null;
  notes?: string | null;
  addresses!: {
    id: number;
    branchName?: string | null;
    direction: string;
    city: string;
    coordinates: {
      latitude?: number | null;
      longitude?: number | null;
    };
    isPrimary: boolean;
  }[];
  phones!: {
    id: number;
    description?: string | null;
    phoneNumber: string;
    type: string;
    hasWhatsapp: boolean;
    isPrimary: boolean;
  }[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(data: Partial<CustomerResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: Customer): CustomerResponseDto {
    return new CustomerResponseDto({
      ...entity,
      addresses: entity.addresses?.map((addr) => ({
        id: addr.id,
        branchName: addr.branchName,
        direction: addr.direction,
        city: addr.city,
        coordinates: {
          latitude: addr.latitude,
          longitude: addr.longitude,
        },
        isPrimary: addr.isPrimary,
      })),
      phones: entity.phones?.map((phone) => ({
        id: phone.id,
        description: phone.description,
        phoneNumber: phone.phoneNumber,
        hasWhatsapp: phone.hasWhatsapp,
        type: phone.type,
        isPrimary: phone.isPrimary,
      })),
    });
  }

  static fromEntities(entities: Customer[]): CustomerResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
