import { CreateEquipmentAssignmentDto } from "../../dtos";
import { CustomError } from "../../errors";
import { EquipmentRepository } from "../../repositories";
import { UUID } from "../../value-object";

interface AssignEquipmentUseCase {
  execute(data: CreateEquipmentAssignmentDto): Promise<void>;
}

export class AssignEquipment implements AssignEquipmentUseCase {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}
  async execute(data: CreateEquipmentAssignmentDto): Promise<void> {
    const equipment = await this.equipmentRepository.findOne(data.equipmentId);

    if (!equipment) throw CustomError.notFound("El equipo no existe");

    // Validar si puede ser asignado (disponible o en mantenimiento)
    if (!equipment.canBeAssigned()) {
      throw CustomError.conflict(
        "El equipo no está disponible para asignación"
      );
    }

    // Pasar el estado actual al datasource para evitar query duplicado
    await this.equipmentRepository.createAssignment(data, equipment.status);
  }
}
