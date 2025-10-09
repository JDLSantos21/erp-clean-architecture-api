import { PrismaClient } from "@prisma/client";
import {
  EquipmentSerialGeneratorI,
  EquipmentType,
  EquipmentSerialNumber,
  CustomError,
} from "../../domain";
import { EQUIPMENT_TYPE } from "../../domain/constants/equipment.constants";

const TYPE_ABBREVIATIONS: Record<EquipmentType, string> = {
  [EQUIPMENT_TYPE.ANAQUEL]: "ANQ",
  [EQUIPMENT_TYPE.NEVERA]: "NEV",
  [EQUIPMENT_TYPE.OTROS]: "EQP",
};

export class EquipmentSerialGenerator extends EquipmentSerialGeneratorI {
  private static readonly MAX_RETRIES = 10;

  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async generate(equipmentType: EquipmentType): Promise<EquipmentSerialNumber> {
    let attempts = 0;

    while (attempts < EquipmentSerialGenerator.MAX_RETRIES) {
      const serialString = this.generateSerialString(equipmentType);
      const alreadyExists = await this.exists(serialString);

      if (!alreadyExists) {
        return EquipmentSerialNumber.create(serialString);
      }

      attempts++;
    }

    throw CustomError.internalServer(
      `No se pudo generar un número de serie después de ${EquipmentSerialGenerator.MAX_RETRIES} intentos`
    );
  }

  async exists(serialNumber: string): Promise<boolean> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { serialNumber },
    });

    return equipment !== null;
  }

  private generateSerialString(equipmentType: EquipmentType): string {
    const typeAbbr = TYPE_ABBREVIATIONS[equipmentType];
    const year = new Date().getFullYear();
    const random = this.generateRandomDigits(4);

    return `${typeAbbr}-${year}-${random}`;
  }

  private generateRandomDigits(length: number): string {
    const max = Math.pow(10, length) - 1;
    const random = Math.floor(Math.random() * (max + 1));
    return random.toString().padStart(length, "0");
  }
}
