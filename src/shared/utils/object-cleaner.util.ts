export interface CleanOptions {
  removeNull?: boolean;
  removeUndefined?: boolean;
  removeEmptyStrings?: boolean;
  trimStrings?: boolean;
}

export function cleanObject<T extends Record<string, any>>(
  obj: T,
  options?: CleanOptions
): Partial<T> {
  const {
    removeNull = true,
    removeUndefined = true,
    removeEmptyStrings = true,
    trimStrings = true,
  } = options || {};

  const cleaned = Object.entries(obj).reduce((acc, [key, value]) => {
    if (removeUndefined && value === undefined) return acc;
    if (removeNull && value === null) return acc;
    if (removeEmptyStrings && value === "") return acc;
    if (trimStrings && typeof value === "string") {
      value = value.trim();
      if (removeEmptyStrings && value === "") return acc;
    }

    acc[key as keyof T] = value;
    return acc;
  }, {} as Partial<T>);

  return cleaned;
}
