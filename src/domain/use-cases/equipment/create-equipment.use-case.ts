import { CreateEquipmentDto } from "../../dtos";
import { Equipment } from "../../entities";
import { EquipmentRepository } from "../../repositories";
import { IEquipmentSerialGenerator } from "../../services";

interface CreateEquipmentUseCase {
  execute(dto: CreateEquipmentDto): Promise<Equipment>;
}

export class CreateEquipment implements CreateEquipmentUseCase {
  constructor(
    private readonly repository: EquipmentRepository,
    private readonly serialGenerator: IEquipmentSerialGenerator
  ) {}

  async execute(dto: CreateEquipmentDto): Promise<Equipment> {
    const model = await this.repository.findOneModel(dto.modelId);

    const serialNumber = await this.serialGenerator.generate(model.type);

    const equipment = await this.repository.createEquipment({
      serialNumber,
      ...dto,
    });

    return equipment;
  }
}
