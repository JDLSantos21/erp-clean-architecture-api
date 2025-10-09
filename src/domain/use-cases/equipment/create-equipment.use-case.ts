// import { CreateEquipmentDto } from "../../dtos";
// import { EquipmentSerialGeneratorI } from "../../services";

// interface CreateEquipmentUseCase {
//   execute(dto: CreateEquipmentDto): Promise<Equipment>;
// }

// export class CreateEquipment implements CreateEquipmentUseCase {
//   constructor(
//     private readonly repository: EquipmentRepository,
//     private readonly serialGenerator: EquipmentSerialGenerator
//   ) {}

//   async execute(dto: CreateEquipmentDto): Promise<Equipment> {
//     // 1. Generar el número de serie automáticamente
//     const serialNumber = await this.serialGenerator.generate(dto.equipmentType);

//     // 2. Crear el equipo con el serial generado
//     const equipment = await this.repository.create({
//       ...dto,
//       serialNumber: serialNumber.getValue(),
//     });

//     return equipment;
//   }
// }
