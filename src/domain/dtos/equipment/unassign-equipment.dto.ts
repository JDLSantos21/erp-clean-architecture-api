import { Validators } from "../../../config";
import { IntegerId, UUID } from "../../value-object";

export type UnassignReason =
  | "REMOVIDO"
  | "DEVUELTO"
  | "DAÑADO"
  | "MANTENIMIENTO";

export class UnassignEquipmentDto {
  private constructor(
    public assignmentId: IntegerId,
    public unassignedBy: UUID,
    public reason: UnassignReason,
    public notes?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: UnassignEquipmentDto] {
    const { assignment_id, unassigned_by, reason, notes } = object;

    if (!assignment_id || !unassigned_by || !reason) {
      return ["Faltan datos obligatorios"];
    }

    const validReasons: UnassignReason[] = [
      "REMOVIDO",
      "DEVUELTO",
      "DAÑADO",
      "MANTENIMIENTO",
    ];

    if (!validReasons.includes(reason)) {
      return ["Razón de desasignación inválida"];
    }

    if (notes && !Validators.isValidString(notes)) {
      return ["Formato de las notas inválidas"];
    }

    try {
      const assignmentId = IntegerId.create(assignment_id);
      const unassignedBy = UUID.create(unassigned_by);

      return [
        undefined,
        new UnassignEquipmentDto(
          assignmentId,
          unassignedBy,
          reason,
          notes ? notes.trim() : undefined
        ),
      ];
    } catch (error: any) {
      return [error.message];
    }
  }
}
