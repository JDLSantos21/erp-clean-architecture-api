import { CustomError } from "../../errors";
import { EquipmentRepository } from "../../repositories";
import { UUID } from "../../value-object";

interface DeleteEquipmentUseCase {
  execute(id: UUID): Promise<void>;
}

export class DeleteEquipment implements DeleteEquipmentUseCase {
  constructor(private readonly repository: EquipmentRepository) {}

  async execute(id: UUID): Promise<void> {
    const equipment = await this.repository.findOne(id);

    if (!equipment) throw CustomError.notFound("El equipo no existe");

    if (equipment.isAssigned())
      throw CustomError.conflict("No se puede eliminar un equipo asignado");

    await this.repository.delete(id);
  }
}
