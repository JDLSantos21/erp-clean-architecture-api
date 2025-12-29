import { buildUtcDateRange } from "../../shared/utils/date-range.util";

type FilterValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | undefined
  | null;

interface FilterRules {
  [key: string]: (value: FilterValue) => any;
}

interface FieldTypeConfig {
  enumFields?: string[];
  relationFilters?: RelationFilter[];
}

/**
 * Configuración para filtros en relaciones anidadas
 *
 * @example
 * // Filtrar Equipment por nombre de Customer (relación indirecta)
 * {
 *   dtoField: 'customerName',
 *   prismaRelation: 'assignments',
 *   nestedPath: 'customer.businessName',
 *   operator: 'some'
 * }
 *
 * Genera:
 * assignments: {
 *   some: {
 *     customer: {
 *       businessName: { contains: 'valor', mode: 'insensitive' }
 *     }
 *   }
 * }
 */
interface RelationFilter {
  /** Campo en el DTO (ej: 'customerName') */
  dtoField: string;
  /** Relación Prisma (ej: 'assignments') */
  prismaRelation: string;
  /** Path anidado hasta el campo (ej: 'customer.businessName') */
  nestedPath: string;
  /** Operador Prisma: 'some', 'every', 'none' */
  operator: "some" | "every" | "none";
  /** Tipo de comparación: 'contains', 'equals', 'in' */
  comparison?: "contains" | "equals" | "in";
}

export function buildWhere<T extends Record<string, any>>(
  filters: T,
  searchFields: string[] = [],
  dateRangeField: string = "createdAt",
  fieldConfig?: FieldTypeConfig
) {
  const where: Record<string, any> = {};
  const { search, startDate, endDate, ...rest } = filters;

  const enumFields = fieldConfig?.enumFields || [];
  const relationFilters = fieldConfig?.relationFilters || [];

  const defaultRules: FilterRules = {
    string: (value) => ({ contains: value as string, mode: "insensitive" }),
    number: (value) => ({ equals: value }),
    boolean: (value) => ({ equals: value }),
    object: (value) => (Array.isArray(value) ? { in: value } : value),
  };

  // Handle regular filters
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null || value === "") continue;

    // Check if this field is handled by a relation filter
    const relationFilter = relationFilters.find((rf) => rf.dtoField === key);
    if (relationFilter) {
      where[relationFilter.prismaRelation] = buildRelationFilter(
        relationFilter,
        value
      );
      continue;
    }

    // Special handling for enum fields
    if (enumFields.includes(key)) {
      where[key] = Array.isArray(value) ? { in: value } : { equals: value };
      continue;
    }

    const type = Array.isArray(value) ? "object" : typeof value;
    const mapper = defaultRules[type];
    if (mapper) where[key] = mapper(value);
  }

  // Handle date range filters
  if (startDate || endDate) {
    where[dateRangeField] = buildUtcDateRange(startDate, endDate);
  }

  // Handle search filters
  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => {
      const parts = field.split(".");

      if (parts.length === 1) {
        return {
          [field]: { contains: search, mode: "insensitive" },
        };
      }

      const [relation, ...nestedPath] = parts;
      let condition: any = { contains: search, mode: "insensitive" };

      for (let i = nestedPath.length - 1; i >= 0; i--) {
        condition = { [nestedPath[i]]: condition };
      }

      return { [relation]: condition };
    });
  }

  return where;
}

/**
 * Construye el filtro de relación anidada
 *
 * @example
 * buildRelationFilter({
 *   dtoField: 'customerName',
 *   prismaRelation: 'assignments',
 *   nestedPath: 'customer.businessName',
 *   operator: 'some',
 *   comparison: 'contains'
 * }, 'John')
 *
 * Retorna:
 * {
 *   some: {
 *     customer: {
 *       businessName: { contains: 'John', mode: 'insensitive' }
 *     }
 *   }
 * }
 */
function buildRelationFilter(config: RelationFilter, value: FilterValue): any {
  const { nestedPath, operator, comparison = "contains" } = config;
  const parts = nestedPath.split(".");

  // Build nested condition from innermost to outermost
  let condition: any;

  if (comparison === "contains") {
    condition = { contains: value, mode: "insensitive" };
  } else if (comparison === "equals") {
    condition = { equals: value };
  } else if (comparison === "in") {
    condition = { in: Array.isArray(value) ? value : [value] };
  }

  // Build nested structure
  for (let i = parts.length - 1; i >= 0; i--) {
    condition = { [parts[i]]: condition };
  }

  // Wrap with operator
  return { [operator]: condition };
}
