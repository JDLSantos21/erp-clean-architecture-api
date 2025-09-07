import { Validators } from "../../../config";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../../constants";

export class EmployeeQueryDto {
  constructor(
    public page: number,
    public limit: number,
    public name?: string,
    public lastName?: string,
    public position?: string,
    public phoneNumber?: string,
    public cedula?: string,
    public employeeCode?: string,
    public search?: string
  ) {}

  static create(queryParams: {
    [key: string]: any;
  }): [string?, EmployeeQueryDto?] {
    const {
      search,
      name,
      last_name,
      position,
      phone_number,
      cedula,
      employee_code,
      page,
      limit,
    } = queryParams;

    const pageNum = Number(page) || DEFAULT_PAGE;
    const limitNum = Number(limit) || DEFAULT_LIMIT;

    if (isNaN(pageNum) || pageNum < 1) {
      return ["Número de página inválido", undefined];
    }

    if (isNaN(limitNum) || limitNum < 1) {
      return ["Número de límite inválido", undefined];
    }

    if (employee_code && !Validators.employeeCode.test(employee_code)) {
      return ["Código de empleado inválido", undefined];
    }

    if (cedula && !Validators.cedula.test(cedula)) {
      return ["Formato de cédula inválido", undefined];
    }

    if (phone_number && !Validators.phoneNumber.test(phone_number)) {
      return ["Formato de número de teléfono inválido", undefined];
    }

    return [
      undefined,
      new EmployeeQueryDto(
        pageNum,
        limitNum,
        name?.trim(),
        last_name?.trim(),
        position?.trim(),
        phone_number?.trim(),
        cedula?.trim(),
        employee_code?.trim(),
        search?.trim()
      ),
    ];
  }
}
