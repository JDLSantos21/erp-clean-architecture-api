import { UnassignEquipmentDto } from "../../dtos";
import { CustomError } from "../../errors";
import { EquipmentRepository } from "../../repositories";

interface UnassignEquipmentUseCase {
  execute(data: UnassignEquipmentDto): Promise<void>;
}

export class UnassignEquipment implements UnassignEquipmentUseCase {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  async execute(data: UnassignEquipmentDto): Promise<void> {
    const assignment = await this.equipmentRepository.findAssignment(
      data.assignmentId
    );

    if (!assignment) {
      throw CustomError.notFound("La asignación no existe");
    }

    if (!assignment.isActive()) {
      console.log(assignment);
      throw CustomError.badRequest(
        "Solo se puede desasignar un equipo con asignación activa"
      );
    }

    if (!assignment.canBeRemoved()) {
      throw CustomError.conflict(
        "El equipo no puede ser removido en su estado actual"
      );
    }

    await this.equipmentRepository.unassignEquipment(data);
  }
}
