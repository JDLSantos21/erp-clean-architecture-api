import { EquipmentType } from "../entities";
import { EquipmentSerialNumber } from "../value-object";

export abstract class EquipmentSerialGeneratorI {
  abstract generate(
    equipmentType: EquipmentType
  ): Promise<EquipmentSerialNumber>;

  abstract exists(serialNumber: string): Promise<boolean>;
}
