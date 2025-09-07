type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | undefined
  | null;

interface FilterRules {
  [key: string]: (value: FilterValue) => any;
}

export function buildWhere<T extends Record<string, any>>(
  filters: T,
  searchFields: string[] = []
) {
  const where: Record<string, any> = {};
  const { search, ...rest } = filters;

  const defaultRules: FilterRules = {
    string: (value) => ({ contains: value as string, mode: "insensitive" }),
    number: (value) => ({ equals: value }),
    boolean: (value) => ({ equals: value }),
    object: (value) => (Array.isArray(value) ? { in: value } : value),
  };

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null || value === "") continue;
    const type = Array.isArray(value) ? "object" : typeof value;
    const mapper = defaultRules[type];
    if (mapper) where[key] = mapper(value);
  }

  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    }));
  }

  return where;
}
