import { Validators } from "../../../config/validators";
import { EMPLOYEE_POSITION } from "../../constants";
import { EmployeePosition as EmployeePositionT } from "../../entities";

export class CreateEmployeeDto {
  constructor(
    public name: string,
    public lastName: string,
    public employeeCode: string,
    public position: EmployeePositionT,
    public phoneNumber?: string,
    public cedula?: string,
    public licenseExpirationDate?: Date,
    public isActive?: boolean
  ) {}
  static create(object: { [key: string]: any }): [string?, CreateEmployeeDto?] {
    const {
      name,
      last_name,
      employee_code,
      position,
      phone_number,
      cedula,
      license_expiration_date,
      is_active = true,
    } = object;

    if (!name || !last_name || !employee_code || !position) {
      return ["Faltan campos requeridos", undefined];
    }

    if (employee_code && !Validators.employeeCode.test(employee_code)) {
      return [
        "El código de empleado debe tener entre 1 y 4 números",
        undefined,
      ];
    }

    if (typeof is_active !== "boolean") {
      return ["El estado de actividad no es válido", undefined];
    }

    if (phone_number && !Validators.phoneNumber.test(phone_number)) {
      return ["El formato del número de teléfono no es válido", undefined];
    }

    if (cedula !== undefined) {
      if (typeof cedula !== "string")
        return ["El tipo de cédula no es válido", undefined];

      if (cedula.trim() === "")
        return ["La cédula no puede estar vacía", undefined];

      if (!Validators.cedula.test(cedula))
        return ["El formato de la cédula no es válido", undefined];
    }

    let validDate: Date | undefined;

    if (license_expiration_date !== undefined) {
      const [error, formattedDate] = Validators.validateAndFormatExpirationDate(
        license_expiration_date
      );

      if (error) return [error, undefined];
      validDate = formattedDate;
    }

    if (
      !Validators.isValidString(position) ||
      !(position in EMPLOYEE_POSITION)
    ) {
      return ["El puesto no es válido", undefined];
    }

    return [
      undefined,
      new CreateEmployeeDto(
        name,
        last_name,
        employee_code,
        position,
        phone_number,
        cedula,
        validDate,
        is_active
      ),
    ];
  }
}
