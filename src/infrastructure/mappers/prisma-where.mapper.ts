import { start } from "repl";
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

export function buildWhere<T extends Record<string, any>>(
  filters: T,
  searchFields: string[] = [],
  dateRangeField: string = "createdAt"
) {
  const where: Record<string, any> = {};
  const { search, startDate, endDate, ...rest } = filters;

  const defaultRules: FilterRules = {
    string: (value) => ({ contains: value as string, mode: "insensitive" }),
    number: (value) => ({ equals: value }),
    boolean: (value) => ({ equals: value }),
    object: (value) => (Array.isArray(value) ? { in: value } : value),
  };

  // Handle regular filters
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null || value === "") continue;
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
