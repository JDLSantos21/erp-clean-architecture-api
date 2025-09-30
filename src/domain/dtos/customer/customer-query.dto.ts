import { Validators } from "../../../config";
import { DEFAULT_PAGE } from "../../constants";

export class CustomerQueryDTO {
  private constructor(
    public page: number,
    public limit: number,
    public businessName?: string,
    public rnc?: string,
    public email?: string,
    public notes?: string,
    public search?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, CustomerQueryDTO?] {
    const { page, limit, business_name, rnc, email, notes, search, is_active } =
      object;

    const pageNum = Number(page) || DEFAULT_PAGE;
    const limitNum = Number(limit) || 10;

    if (!Validators.isPositiveInteger(pageNum)) {
      return ["Número de página inválido", undefined];
    }

    if (!Validators.isPositiveInteger(limitNum)) {
      return ["Número de límite inválido", undefined];
    }

    if (rnc && !Validators.rnc.test(rnc)) {
      return ["RNC inválido", undefined];
    }

    if (email && !Validators.email.test(email)) {
      return ["Email inválido", undefined];
    }

    if (is_active && !Validators.isBoolean(is_active)) {
      return ["Estado inválido", undefined];
    }

    if (notes && !Validators.isValidString(notes)) {
      return ["La nota debe ser una cadena de texto válida", undefined];
    }

    if (business_name && !Validators.isValidString(business_name)) {
      return [
        "El nombre del negocio debe ser una cadena de texto válida",
        undefined,
      ];
    }

    if (search && !Validators.isValidString(search)) {
      return [
        "El término de búsqueda debe ser una cadena de texto válida",
        undefined,
      ];
    }

    return [
      undefined,
      new CustomerQueryDTO(
        pageNum,
        limitNum,
        business_name,
        rnc,
        email,
        notes,
        search
      ),
    ];
  }
}
